import { NextResponse } from 'next/server';
import {
  createDemoToken,
  createUser,
  findUserByEmail,
  setCurrentUser,
} from '@/lib/server/demo-store';

interface RegisterPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterPayload;
  const name = body.name?.trim();
  const email = body.email?.trim();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: 'Name, email, and password are required' },
      { status: 400 }
    );
  }

  if (findUserByEmail(email)) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 });
  }

  const user = createUser({ name, email });
  setCurrentUser(user);

  return NextResponse.json({
    user,
    token: createDemoToken(user.id),
  });
}
