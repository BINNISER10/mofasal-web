'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SignaturePadProps = {
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
};

export function SignaturePad({ onChange, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#00373E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const emit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(empty ? null : canvas.toDataURL('image/png'));
  }, [empty, onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 520;
    canvas.height = 160;
    const ctx = getCtx();
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [getCtx]);

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className={`w-full h-40 rounded-xl border-2 border-dashed border-[#00373E]/30 bg-white touch-none ${
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-crosshair'
        }`}
        onPointerDown={(e) => {
          if (disabled) return;
          drawing.current = true;
          const ctx = getCtx();
          const p = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(p.x, p.y);
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current || disabled) return;
          const ctx = getCtx();
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
          if (empty) setEmpty(false);
        }}
        onPointerUp={() => {
          drawing.current = false;
          emit();
        }}
        onPointerLeave={() => {
          if (drawing.current) {
            drawing.current = false;
            emit();
          }
        }}
      />
      <button
        type="button"
        onClick={clear}
        disabled={disabled || empty}
        className="text-xs text-[#735B4D] hover:text-[#00373E] disabled:opacity-40"
      >
        مسح التوقيع
      </button>
    </div>
  );
}
