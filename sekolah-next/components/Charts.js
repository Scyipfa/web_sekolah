'use client';
import { useEffect, useRef } from 'react';

const PALETTE = ['#4f46e5', '#16a34a', '#d97706', '#0284c7', '#dc2626', '#7c3aed', '#0d9488', '#db2777'];

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth || 600;
  canvas.width = w * dpr;
  canvas.height = height * dpr;
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h: height };
}

function drawBar(canvas, labels, values, colors) {
  const { ctx, w: W, h: H } = setupCanvas(canvas, 240);
  const padL = 40, padB = 40, padT = 16, padR = 12;
  const maxV = Math.ceil(Math.max(...values, 1) * 1.15);
  const cw = W - padL - padR, ch = H - padT - padB;
  const n = labels.length;
  const slot = cw / n, barW = Math.min(56, slot * 0.55);
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = padT + ch - (ch * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillText(Math.round((maxV * i) / 5), padL - 8, y + 4);
  }
  ctx.textAlign = 'center';
  for (let j = 0; j < n; j++) {
    const bh = ch * (values[j] / maxV);
    const x = padL + slot * j + (slot - barW) / 2;
    const yb = padT + ch - bh;
    ctx.fillStyle = colors[j] || PALETTE[j % PALETTE.length];
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, yb, barW, bh, [5, 5, 0, 0]);
    else ctx.rect(x, yb, barW, bh);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(values[j], x + barW / 2, yb - 6);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    let lbl = String(labels[j] || '(tanpa jurusan)');
    if (lbl.length > 12) lbl = lbl.substr(0, 11) + '…';
    ctx.fillText(lbl, padL + slot * j + slot / 2, H - padB + 16);
  }
}

function drawDonut(canvas, values, colors) {
  const { ctx, w, h } = setupCanvas(canvas, 220);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 14, inner = r * 0.62;
  let start = -Math.PI / 2;
  values.forEach((v, i) => {
    const ang = (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.fillStyle = colors[i] || PALETTE[i % PALETTE.length];
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + ang);
    ctx.closePath();
    ctx.fill();
    start += ang;
  });
  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy + 2);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Total', cx, cy + 20);
}

export default function Chart({ type, labels, values, colors = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    const draw = () => {
      if (!ref.current) return;
      if (type === 'bar') drawBar(ref.current, labels, values, colors);
      else drawDonut(ref.current, values, colors);
    };
    draw();
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(draw, 200);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [type, labels, values, colors]);

  const total = values.reduce((a, b) => a + b, 0) || 1;
  return (
    <>
      <canvas ref={ref}></canvas>
      {type === 'donut' && (
        <div className="chart-legend">
          {labels.map((l, i) => (
            <span key={i}>
              <i className="legend-dot" style={{ background: colors[i] || PALETTE[i % PALETTE.length] }}></i>
              {l} ({values[i]} · {Math.round((values[i] / total) * 100)}%)
            </span>
          ))}
        </div>
      )}
    </>
  );
}
