'use client';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = 'btn btn-primary', ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} {...props}>
      {children}
    </button>
  );
}
