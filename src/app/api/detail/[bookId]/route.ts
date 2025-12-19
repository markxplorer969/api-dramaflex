import { NextRequest, NextResponse } from 'next/server';
import { scraper } from '@/lib/scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    
    if (!bookId) {
      return NextResponse.json({
        status: false,
        code: 400,
        message: 'Book ID is required',
        data: null,
      }, { status: 400 });
    }
    
    const data = await scraper.detail(bookId);
    
    return NextResponse.json({
      status: true,
      code: 200,
      message: `Details for "${bookId}" retrieved successfully`,
      data,
    });
  } catch (error) {
    console.error('Error in /api/detail/[bookId]:', error);
    
    return NextResponse.json({
      status: false,
      code: 500,
      message: error instanceof Error ? error.message : 'Failed to retrieve drama details',
      data: null,
    }, { status: 500 });
  }
}