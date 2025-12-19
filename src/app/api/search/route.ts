import { NextRequest, NextResponse } from 'next/server';
import { scraper } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({
        status: false,
        code: 400,
        message: 'Query parameter "q" is required',
        data: null,
      }, { status: 400 });
    }
    
    const data = await scraper.search(query);
    
    return NextResponse.json({
      status: true,
      code: 200,
      message: `Search results for "${query}" retrieved successfully`,
      data,
    });
  } catch (error) {
    console.error('Error in /api/search:', error);
    
    return NextResponse.json({
      status: false,
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to perform search',
      data: null,
    }, { status: 500 });
  }
}