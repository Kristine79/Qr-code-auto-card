import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
    appUrl: process.env.APP_URL || 'Not set'
  });
}
