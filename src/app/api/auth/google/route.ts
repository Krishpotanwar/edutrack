import { NextResponse } from 'next/server';
import { getUsers, setCurrentUser } from '@/lib/server/demo-store';

export async function POST() {
  const users = getUsers();
  const user = users[0];

  if (!user) {
    return NextResponse.json({ message: 'No demo user available' }, { status: 500 });
  }

  setCurrentUser(user);

  return NextResponse.json({
    user,
    token: 'mock-jwt-token-google',
  });
}
