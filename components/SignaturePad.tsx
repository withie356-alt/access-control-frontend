
import React, { useRef, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onSignatureEnd: (signature: string) => void;
  onClear: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureEnd, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  }, []);
  
  const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = getCanvasContext();
        if(ctx) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
        }
      }
  }, [getCanvasContext]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
        window.removeEventListener('resize', resizeCanvas);
    }
  }, [resizeCanvas]);

  const getEventPosition = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
        return {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top,
        };
    }
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCanvasContext();
    const pos = getEventPosition(event);
    if (ctx && pos) {
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = getCanvasContext();
    const pos = getEventPosition(event);
    if (ctx && pos) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = getCanvasContext();
    if (ctx) {
        ctx.closePath();
        isDrawing.current = false;
        const canvas = canvasRef.current;
        if(canvas) {
            onSignatureEnd(canvas.toDataURL('image/png'));
        }
    }
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if(canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onClear();
    }
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button type="button" onClick={handleClear} className="mt-2 text-sm text-power-blue-600 hover:underline">
        서명 초기화
      </button>
    </div>
  );
};

export default SignaturePad;
