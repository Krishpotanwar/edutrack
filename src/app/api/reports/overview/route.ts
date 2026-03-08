import { NextResponse } from 'next/server';
import { getReportsOverview } from '@/lib/server/demo-store';

export async function GET() {
  return NextResponse.json(getReportsOverview());
}
