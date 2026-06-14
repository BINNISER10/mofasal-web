export type PartySignature = {
  partyId: number;
  name: string;
  role: string;
  idNumber: string;
  signatureDataUrl: string;
  signedAt: string;
};

export type MouSignState = Record<number, PartySignature>;

const STORAGE_KEY = 'mofasal-mou-signatures';

export function loadSignatures(): MouSignState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MouSignState) : {};
  } catch {
    return {};
  }
}

export function saveSignatures(state: MouSignState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAllSignatures() {
  localStorage.removeItem(STORAGE_KEY);
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
    .toUpperCase();
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function arabicTextToPng(text: string, width = 400, height = 36): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#00373E';
  ctx.font = '600 18px "IBM Plex Sans Arabic", Tahoma, sans-serif';
  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  ctx.fillText(text, width - 8, 24);
  return canvas.toDataURL('image/png');
}

export async function generateSignedMouPdf(signatures: MouSignState): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  const baseRes = await fetch('/investor/MOFASAL-MOU.pdf');
  if (!baseRes.ok) throw new Error('تعذّر تحميل ملف المذكرة الأساسي');
  const baseBytes = new Uint8Array(await baseRes.arrayBuffer());

  const pdf = await PDFDocument.load(baseBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const entries = Object.values(signatures).sort((a, b) => a.partyId - b.partyId);
  const payload = entries.map((e) => `${e.partyId}|${e.name}|${e.idNumber}|${e.signedAt}`).join(';');
  const verifyCode = await sha256(payload + baseBytes.length);

  const page = pdf.addPage([595, 842]);
  const { width, height } = page.getSize();
  const teal = rgb(0, 0.216, 0.243);
  const gold = rgb(0.831, 0.627, 0.09);

  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: teal });
  page.drawText('MUFASAL — Electronic Signature Certificate', {
    x: 40,
    y: height - 45,
    size: 14,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Memorandum of Understanding — Digitally Signed Copy', {
    x: 40,
    y: height - 65,
    size: 10,
    font,
    color: gold,
  });

  page.drawText(`Verification: ${verifyCode}`, { x: 40, y: height - 110, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`Generated: ${new Date().toISOString()}`, { x: 40, y: height - 125, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  const colW = (width - 80) / 2;
  const yStart = height - 170;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * (colW + 8);
    const baseY = yStart - row * 195;
    const boxH = 175;

    page.drawRectangle({
      x,
      y: baseY - boxH,
      width: colW,
      height: boxH,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98),
    });

    const namePng = await arabicTextToPng(`${entry.name} — ${entry.role}`, colW - 20, 40);
    const nameImg = await pdf.embedPng(dataUrlToBytes(namePng));
    page.drawImage(nameImg, { x: x + 8, y: baseY - 42, width: colW - 16, height: 32 });

    const sigBytes = dataUrlToBytes(entry.signatureDataUrl);
    const sigImg = await pdf.embedPng(sigBytes);
    const sigScale = Math.min((colW - 24) / sigImg.width, 70 / sigImg.height);
    page.drawImage(sigImg, {
      x: x + 12,
      y: baseY - 120,
      width: sigImg.width * sigScale,
      height: sigImg.height * sigScale,
    });

    page.drawText(`ID: ${entry.idNumber || '—'}`, { x: x + 10, y: baseY - 135, size: 8, font, color: rgb(0.35, 0.35, 0.35) });
    page.drawText(`Signed: ${entry.signedAt}`, { x: x + 10, y: baseY - 150, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
    page.drawText('E-SIGNATURE', { x: x + colW - 70, y: baseY - 165, size: 7, font: bold, color: gold });
  }

  page.drawText(
    'This document was electronically signed via mofasal.netlify.app/investor/mou',
    { x: 40, y: 30, size: 7, font, color: rgb(0.55, 0.55, 0.55) },
  );

  return pdf.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
