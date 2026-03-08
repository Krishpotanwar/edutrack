import { NextResponse } from 'next/server';
import { createDemoToken, findUserByEmail, setCurrentUser } from '@/lib/server/demo-store';

interface LoginPayload {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    );
  }

  const user = findUserByEmail(email);
  if (!user || password !== 'password123') {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  if (user.suspended) {
    return NextResponse.json({ message: 'User is suspended' }, { status: 403 });
  }

  setCurrentUser(user);

  return NextResponse.json({
    user,
    token: createDemoToken(user.id),
  });
}
