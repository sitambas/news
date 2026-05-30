import { NextResponse } from 'next/server';

export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message = 'Error', status = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return NextResponse.json(body, { status });
}

export function paginatedResponse(data, pagination, message = 'Success') {
  return NextResponse.json({ success: true, message, data, pagination }, { status: 200 });
}
