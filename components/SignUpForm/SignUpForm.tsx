'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api/auth';
import css from './SignUpForm.module.css';

export default function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      setLoading(true);
      setError('');
      await register({ email, password });
      router.push('/sign-in');
    } catch {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <label className={css.label}>
        Email
        <input className={css.input} type="email" name="email" required />
      </label>
      <label className={css.label}>
        Password
        <input className={css.input} type="password" name="password" required />
      </label>
      {error && <p className={css.error}>{error}</p>}
      <button className={css.button} type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign up'}
      </button>
      <p className={css.link}>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </form>
  );
}