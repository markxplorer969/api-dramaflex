import axios from 'axios';
import * as cheerio from 'cheerio';

const CONFIG = {
  BASE_URL: 'https://dramabox.web.id',
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

const request = async (url: string) => {
  try {
    const response = await axios.get(url, { headers: CONFIG.HEADERS });
    return cheerio.load(response.data);
  } catch (error) {
    throw new Error(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const resolveUrl = (link: string) => {
  if (link && !link.startsWith('http')) {
    return `${CONFIG.BASE_URL}/${link.replace(/^\//, '')}`;
  }
  return link;
};

const getBookIdFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('bookId');
  } catch (e) {
    return null;
  }
};

interface DramaCard {
  title: string;
  book_id: string | null;
  image?: string;
  views?: string;
  episodes?: string;
  rank?: string;
}

interface DramaDetail {
  book_id: string;
  title: string;
  description: string;
  thumbnail?: string;
  upload_date?: string;
  stats: {
    followers?: string;
    total_episodes?: string;
  };
  episode_list: Array<{
    episode: number;
    id: string;
  }>;
}

interface DramaStream {
  book_id: string;
  episode: string;
  video_url?: string;
}

class DramaBoxScraper {
  async getLatest(): Promise<DramaCard[]> {
    try {
      const $ = await request(CONFIG.BASE_URL);
      const latest: DramaCard[] = [];
      
      $('.drama-grid .drama-card').each((_, el) => {
        const link = resolveUrl($(el).find('.watch-button').attr('href') || '');
        latest.push({
          title: $(el).find('.drama-title').text().trim(),
          book_id: getBookIdFromUrl(link),
          image: $(el).find('.drama-image img').attr('src'),
          views: $(el).find('.drama-meta span').first().text().trim().split(' ')[1],
          episodes: $(el).find('.drama-meta span[itemprop="numberOfEpisodes"]').text().trim().split(' ')[1]
        });
      });

      return latest;
    } catch (error) {
      throw new Error(`Failed to get latest updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrending(): Promise<DramaCard[]> {
    try {
      const $ = await request(CONFIG.BASE_URL);
      const trending: DramaCard[] = [];
      
      $('.sidebar-widget .rank-list .rank-item').each((_, el) => {
        const link = resolveUrl($(el).attr('href') || '');
        trending.push({
          rank: $(el).find('.rank-number').text().trim(),
          title: $(el).find('.rank-title').text().trim(),
          book_id: getBookIdFromUrl(link),
          image: $(el).find('.rank-image img').attr('src'),
          views: $(el).find('.rank-meta span').eq(0).text().trim().split(' ')[1],
          episodes: $(el).find('.rank-meta span').eq(1).text().trim().split(' ')[1]
        });
      });

      return trending;
    } catch (error) {
      throw new Error(`Failed to get trending content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<DramaCard[]> {
    try {
      if (!query.trim()) {
        throw new Error('Search query cannot be empty');
      }

      const targetUrl = `${CONFIG.BASE_URL}/search.php?lang=in&q=${encodeURIComponent(query.trim())}`;
      const $ = await request(targetUrl);
      const results: DramaCard[] = [];

      $('.drama-grid .drama-card').each((_, el) => {
        const link = resolveUrl($(el).find('.watch-button').attr('href') || '');
        results.push({
          title: $(el).find('.drama-title').text().trim(),
          book_id: getBookIdFromUrl(link),
          views: $(el).find('.drama-meta span').first().text().trim().split(' ')[1],
          image: $(el).find('.drama-image img').attr('src')
        });
      });

      return results;
    } catch (error) {
      throw new Error(`Failed to search for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async detail(bookId: string): Promise<DramaDetail> {
    try {
      if (!bookId.trim()) {
        throw new Error('Book ID cannot be empty');
      }

      const targetUrl = `${CONFIG.BASE_URL}/watch.php?bookId=${bookId}&lang=in`;
      const $ = await request(targetUrl);

      const fullTitle = $('.video-title').text().trim();
      const cleanTitle = fullTitle.split('- Episode')[0].trim();
      
      const episodes: Array<{ episode: number; id: string }> = [];
      $('.episodes-grid .episode-btn').each((_, el) => {
        const episodeText = $(el).text().trim();
        const episodeNum = parseInt(episodeText);
        if (!isNaN(episodeNum)) {
          episodes.push({
            episode: episodeNum,
            id: $(el).attr('data-episode') || ''
          });
        }
      });

      return {
        book_id: bookId,
        title: cleanTitle,
        description: $('.video-description').text().trim(),
        thumbnail: $('meta[itemprop="thumbnailUrl"]').attr('content'),
        upload_date: $('meta[itemprop="uploadDate"]').attr('content'),
        stats: {
          followers: $('.video-meta span').first().text().trim().split(' ')[1],
          total_episodes: $('span[itemprop="numberOfEpisodes"]').text().trim().split(' ')[1],
        },
        episode_list: episodes
      };
    } catch (error) {
      throw new Error(`Failed to get details for "${bookId}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stream(bookId: string, episode: string): Promise<DramaStream> {
    try {
      if (!bookId.trim() || !episode.trim()) {
        throw new Error('Book ID and episode cannot be empty');
      }

      const targetUrl = `${CONFIG.BASE_URL}/watch.php?bookId=${bookId}&lang=in&episode=${episode}`;
      const $ = await request(targetUrl);

      let videoUrl = $('#mainVideo source').attr('src');
      if (!videoUrl) {
        videoUrl = $('#mainVideo').attr('src');
      }

      return {
        book_id: bookId,
        episode: episode,
        video_url: videoUrl
      };
    } catch (error) {
      throw new Error(`Failed to get stream for "${bookId}/${episode}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const scraper = new DramaBoxScraper();
export type { DramaCard, DramaDetail, DramaStream };