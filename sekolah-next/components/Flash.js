'use client';
import { useEffect, useState } from 'react';

export default function Flash({ messages }) {
  const key = JSON.stringify(messages);
  const [items, setItems] = useState(messages);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setItems(messages);
    setFading(false);
    if (messages.length) document.cookie = 'flash=; Max-Age=0; path=/';
    const t1 = setTimeout(() => setFading(true), 4000);
    const t2 = setTimeout(() => setItems((it) => it.filter((m) => m.type !== 'success')), 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return items.map((f, i) => (
    <div
      key={i}
      className={`alert alert-${f.type}`}
      style={f.type === 'success' && fading ? { transition: 'opacity .5s', opacity: 0 } : undefined}
    >
      {f.msg}
    </div>
  ));
}
