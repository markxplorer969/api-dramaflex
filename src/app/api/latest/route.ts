import { NextRequest, NextResponse } from 'next/server';
import { scraper } from '@/lib/scraper';

export async function GET(request: NextRequest) {
  try {
    const data = await scraper.getLatest();
    
    return NextResponse.json({
      status: true,
      code: 200,
      message: 'Latest updates retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('Error in /api/latest:', error);
    
    return NextResponse.json({
      status: false,
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to retrieve latest updates',
      data: null,
    }, { status: 500 });
  }
}