import { NextRequest, NextResponse } from 'next/server';
import { scraper } from '@/lib/scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; episode: string } }
) {
  try {
    const { bookId, episode } = params;
    
    if (!bookId || !episode) {
      return NextResponse.json({
        status: false,
        code: 400,
        message: 'Book ID and episode are required',
        data: null,
      }, { status: 400 });
    }
    
    const data = await scraper.stream(bookId, episode);
    
    return NextResponse.json({
      status: true,
      code: 200,
      message: `Stream for "${bookId}/${episode}" retrieved successfully`,
      data,
    });
  } catch (error) {
    console.error('Error in /api/stream/[bookId]/[episode]:', error);
    
    return NextResponse.json({
      status: false,
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to retrieve stream',
      data: null,
    }, { status: 500 });
  }
}