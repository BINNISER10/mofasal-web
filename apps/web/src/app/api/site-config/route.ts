import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');

export async function GET() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to write config' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    const patch = await req.json();
    const merged = deepMerge(existing, patch);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: merged });
  } catch {
    return NextResponse.json({ error: 'Failed to patch config' }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge((target[key] as Record<string, unknown>) || {}, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
