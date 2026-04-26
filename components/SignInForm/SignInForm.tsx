'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api/auth';
import css from './SignInForm.module.css';

export default function SignInForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value ?? '';
    const password = passwordRef.current?.value ?? '';

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      router.push('/notes/filter/all');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <label className={css.label}>
        Email
        <input
          ref={emailRef}
          className={css.input}
          type="email"
          name="email"
          autoComplete="email"
        />
      </label>
      <label className={css.label}>
        Password
        <input
          ref={passwordRef}
          className={css.input}
          type="password"
          name="password"
          autoComplete="current-password"
        />
      </label>
      {error && <p className={css.error}>{error}</p>}
      <button className={css.button} type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p className={css.link}>
        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
      </p>
    </form>
  );
}