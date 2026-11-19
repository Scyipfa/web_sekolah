'use client';
import { useState } from 'react';

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-password">
      <input {...props} type={show ? 'text' : 'password'} />
      <button type="button" className="toggle-pw" aria-label="Tampilkan password" onClick={() => setShow((s) => !s)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
}
