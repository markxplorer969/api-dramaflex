import { NextRequest, NextResponse } from 'next/server';
import { scraper } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  try {
    const data = await scraper.getTrending();
    
    return NextResponse.json({
      status: true,
      code: 200,
      message: 'Trending content retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('Error in /api/trending:', error);
    
    return NextResponse.json({
      status: false,
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to retrieve trending content',
      data: null,
    }, { status: 500 });
  }
}