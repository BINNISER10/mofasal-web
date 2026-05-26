import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');

export async function POST(req: NextRequest) {
  try {
    const { message, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key required' }, { status: 400 });
    }

    const currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    const systemPrompt = `You are an AI assistant that controls a Saudi tailoring platform website called "مفصل" (Mofasal).
You have full control over the website content. The current configuration is:
${JSON.stringify(currentConfig, null, 2)}

When the user gives you a command, you must:
1. Understand what they want to change
2. Return a JSON patch object with ONLY the fields that need to change
3. Also return a human-readable response in Arabic explaining what you changed

IMPORTANT: Always respond with valid JSON in this exact format:
{
  "response": "وصف بالعربي لما تم تغييره",
  "patch": { ... only the fields that changed ... },
  "action": "update" | "info" | "reset"
}

Examples of commands you can handle:
- "غير عنوان الهيرو إلى كذا" → patch hero.titleAr
- "أضف إحصائية جديدة" → patch stats array
- "غير اللون الرئيسي إلى أزرق" → patch theme.primaryColor
- "اكتب وصف SEO جديد" → patch seo fields
- "غير نص زر الدعوة للتسجيل" → patch cta fields
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || 'OpenAI error' }, { status: 400 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return NextResponse.json({ response: content, patch: null, action: 'info' });
    }

    // Apply patch if present
    if (parsed.patch && Object.keys(parsed.patch).length > 0) {
      const merged = deepMerge(currentConfig, parsed.patch);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
