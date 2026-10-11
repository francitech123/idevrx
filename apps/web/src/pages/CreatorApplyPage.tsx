import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { ApiRequestError } from '@/api/client';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { useApplyForCreator, useOwnApplication } from '@/features/creator/useCreator';

const schema = z.object({
  motivation: z
    .string()
    .min(40, 'Please write at least 40 characters')
    .max(2000, 'Maximum 2000 characters'),
  experience: z.string().max(1000, 'Maximum 1000 characters').optional(),
  portfolioUrl: z
    .string()
    .max(500)
    .optional()
    .refine(
      (v) => !v || v === '' || /^https?:\/\/.+/.test(v),
      'Must start with http:// or https://'
    ),
});
type FormValues = z.infer<typeof schema>;

export function CreatorApplyPage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data, isLoading: appLoading } = useOwnApplication(!!user && !isCreator(user));
  const apply = useApplyForCreator();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { motivation: '', experience: '', portfolioUrl: '' },
  });

  useEffect(() => {
    if (data?.application?.status === 'pending') {
      // Don't reset the form when we're about to show the pending state.
    }
  }, [data]);

  if (authLoading || appLoading) {
    return (
      <div className="idx-page">
        <div
          style={{
            height: 32,
            width: 200,
            background: 'var(--color-paper-muted)',
            borderRadius: 6,
          }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isCreator(user)) return <Navigate to="/" replace />;

  const existing = data?.application;

  async function onSubmit(values: FormValues) {
    try {
      await apply.mutateAsync({
        motivation: values.motivation,
        experience: values.experience ?? '',
        portfolioUrl: values.portfolioUrl ?? '',
      });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError('root', { message: err.message });
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' });
      }
    }
  }

  if (existing?.status === 'pending') {
    return (
      <div className="idx-page">
        <div className="idx-eyebrow">Application</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4.2vw, 48px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            margin: '14px 0 16px',
            color: 'var(--color-ink)',
          }}
        >
          Application under review
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-ink-subtle)',
            lineHeight: 1.7,
            fontSize: 16,
            marginBottom: 28,
          }}
        >
          Thanks for applying. A moderator or admin will review your application.
          You'll be able to create projects as soon as your application is approved.
        </p>
        <div
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-line)',
            borderRadius: 10,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Row label="Submitted" value={new Date(existing.submittedAt).toLocaleString()} />
          <Row label="Status" value={existing.status} />
        </div>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginTop: 28,
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
          }}
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Creator access</div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4.2vw, 48px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.08,
          margin: '14px 0 16px',
          color: 'var(--color-ink)',
        }}
      >
        Become a Creator
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-ink-subtle)',
          lineHeight: 1.7,
          fontSize: 16,
          marginBottom: 32,
        }}
      >
        Creator access lets you publish engineering projects on IDEVRX. Tell us
        a bit about what you'd like to build and document.
      </p>

      {existing?.status === 'denied' && existing.reviewedAt && (
        <div
          style={{
            marginBottom: 28,
            padding: 18,
            border: '1px solid var(--color-warning)',
            background: 'var(--color-warning-bg)',
            borderRadius: 8,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              color: 'var(--color-warning)',
              marginBottom: 6,
            }}
          >
            Previous application denied
          </p>
          {existing.reviewNote && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--color-ink-subtle)',
                marginBottom: 8,
              }}
            >
              Note: {existing.reviewNote}
            </p>
          )}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--color-muted)',
            }}
          >
            You can re-apply 7 days after the denial.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field
          label="Why do you want to be a Creator?"
          htmlFor="motivation"
          error={errors.motivation?.message}
          hint="What kind of projects would you document? At least 40 characters."
          required
        >
          <textarea
            id="motivation"
            rows={6}
            placeholder="I build..."
            {...register('motivation')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Experience (optional)"
          htmlFor="experience"
          error={errors.experience?.message}
          hint="Skills, tools, or background relevant to your projects."
        >
          <textarea
            id="experience"
            rows={3}
            placeholder="Languages, platforms, years of experience..."
            {...register('experience')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Portfolio URL (optional)"
          htmlFor="portfolioUrl"
          error={errors.portfolioUrl?.message}
          hint="GitHub, personal site, or any link that shows your work."
        >
          <input
            id="portfolioUrl"
            type="url"
            placeholder="https://"
            {...register('portfolioUrl')}
            className="idx-input"
          />
        </Field>

        {errors.root && (
          <div
            style={{
              padding: '12px 16px',
              border: '1px solid var(--color-error)',
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              borderRadius: 8,
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              marginBottom: 16,
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
            padding: '12px 24px',
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
          {isSubmitting ? 'Submitting...' : 'Submit application'}
        </button>
      </form>

      <style>{`
        .idx-input {
          display: block;
          width: 100%;
          border: 1px solid var(--color-line);
          border-radius: 6px;
          padding: 10px 12px;
          font-family: var(--font-sans);
          font-size: 14px;
          background: var(--color-paper);
          color: var(--color-ink);
          outline: none;
          resize: vertical;
        }
        .idx-input:focus {
          border-color: var(--color-accent);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={htmlFor}
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
        {required && (
          <span style={{ color: 'var(--color-accent)', marginLeft: 4 }}>*</span>
        )}
      </label>
      {children}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 24,
        paddingBottom: 12,
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--color-ink)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
