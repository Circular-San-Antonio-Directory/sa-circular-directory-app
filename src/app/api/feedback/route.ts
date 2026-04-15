import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const token = process.env.AIRTABLE_FEEDBACK_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_FEEDBACK_TABLE_ID;

  if (!token || !baseId || !tableId) {
    console.error('Missing Airtable environment variables.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: { Name: name, Email: email, Message: message },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('Airtable error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
