import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister } from '@/features/auth/useAuth';
import { ApiRequestError } from '@/api/client';

const schema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(64),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(32)
    .regex(/^[a-z0-9_]+$/i, 'Letters, numbers, and underscores only'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(10, 'At least 10 characters')
    .regex(/[a-z]/, 'Add a lowercase letter')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[0-9]/, 'Add a number'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');
  const afterSignup = intent === 'creator' ? '/creator/apply' : '/home';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await registerMutation.mutateAsync(values);
      navigate(afterSignup, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.fields) {
        for (const [field, msg] of Object.entries(err.fields)) {
          setError(field as keyof FormValues, { message: msg });
        }
      } else if (err instanceof ApiRequestError) {
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
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="idx-eyebrow" style={{ marginBottom: 14 }}>
          Create account
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
          Join IDEVRX.
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
          Create an account to explore, learn, and take part in the community.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field
            label="Display name"
            id="displayName"
            autoComplete="name"
            error={errors.displayName?.message}
            register={register}
          />
          <Field
            label="Username"
            id="username"
            autoComplete="username"
            error={errors.username?.message}
            hint="Letters, numbers, underscores."
            register={register}
          />
          <Field
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            register={register}
          />
          <Field
            label="Password"
            id="password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            hint="At least 10 characters, with upper, lower, and a number."
            register={register}
          />

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
            {isSubmitting ? 'Creating account...' : 'Create account'}
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
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign in
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

function Field({
  label,
  id,
  type = 'text',
  autoComplete,
  error,
  hint,
  register,
}: {
  label: string;
  id: keyof FormValues;
  type?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  register: any;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-ink)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...register(id)}
        className="auth-input"
      />
      {hint && !error && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginTop: 4,
          }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-error)',
            marginTop: 4,
          }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
