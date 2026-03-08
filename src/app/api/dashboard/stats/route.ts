import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/server/demo-store';

export async function GET() {
  return NextResponse.json(getDashboardStats());
}
