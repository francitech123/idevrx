import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '@/features/auth/useAuth';
import { ApiRequestError } from '@/api/client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/home';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login.mutateAsync(values);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError('root', { message: err.message });
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' });
      }
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 24px',
        background: 'var(--color-paper)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="idx-eyebrow" style={{ marginBottom: 14 }}>
          Sign in
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4.5vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            marginBottom: 12,
            color: 'var(--color-ink)',
          }}
        >
          Welcome back.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-muted)',
            fontSize: 16,
            marginBottom: 36,
            lineHeight: 1.6,
          }}
        >
          Sign in to continue to your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-ink)',
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="auth-input"
            />
            {errors.email && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-error)',
                  marginTop: 4,
                }}
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 22 }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-ink)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="auth-input"
            />
            {errors.password && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-error)',
                  marginTop: 4,
                }}
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div
              style={{
                padding: '12px 16px',
                border: '1px solid var(--color-error)',
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                borderRadius: 8,
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                marginBottom: 18,
              }}
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px 24px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              border: 0,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: isSubmitting ? 'wait' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p
          style={{
            marginTop: 26,
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-muted)',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Create one
          </Link>
        </p>

        <style>{`
          .auth-input {
            display: block;
            width: 100%;
            border: 1px solid var(--color-line);
            border-radius: 6px;
            padding: 12px 14px;
            font-family: var(--font-sans);
            font-size: 14px;
            background: var(--color-card);
            color: var(--color-ink);
            outline: none;
          }
          .auth-input:focus {
            border-color: var(--color-accent);
          }
        `}</style>
      </div>
    </div>
  );
}
