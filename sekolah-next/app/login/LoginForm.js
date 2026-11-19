'use client';
import { useActionState } from 'react';
import PasswordInput from '@/components/PasswordInput';
import SubmitButton from '@/components/SubmitButton';
import { login } from './actions';

export default function LoginForm() {
  const [state, action] = useActionState(login, { error: '', username: '' });
  return (
    <>
      {state.error && <div className="alert alert-danger">{state.error}</div>}
      <form action={action} autoComplete="off" key={state.n}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required maxLength={50} defaultValue={state.username} placeholder="Masukkan username" autoFocus />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required placeholder="Masukkan password" />
        </div>
        <SubmitButton className="btn btn-primary btn-block">Masuk</SubmitButton>
      </form>
    </>
  );
}
