import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
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
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { motivation: '', experience: '', portfolioUrl: '' },
  });

  // Pre-fill from previous denied application? No — start clean each time.

  useEffect(() => {
    if (data?.application?.status === 'pending') {
      reset();
    }
  }, [data, reset]);

  if (authLoading || appLoading) {
    return (
      <div className="max-w-reading mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
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

  // Pending application state
  if (existing?.status === 'pending') {
    return (
      <div className="max-w-reading mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-3">Application under review</h1>
        <p className="text-text-secondary mb-6">
          Thanks for applying. A moderator or admin will review your application. You'll be able
          to create projects as soon as your application is approved.
        </p>
        <div className="rounded-card border border-border bg-surface p-5 space-y-3">
          <Row label="Submitted" value={new Date(existing.submittedAt).toLocaleString()} />
          <Row label="Status" value={existing.status} />
        </div>
        <Link to="/" className="inline-block mt-6 text-brand-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Become a Creator</h1>
      <p className="text-text-secondary mb-8">
        Creator access lets you publish engineering projects on IDEVRX. Tell us a bit about
        what you'd like to build and document.
      </p>

      {existing?.status === 'denied' && existing.reviewedAt && (
        <div className="mb-6 rounded-card border border-warning bg-warning/5 p-4 text-sm">
          <p className="font-medium text-warning mb-1">Previous application denied</p>
          {existing.reviewNote && (
            <p className="text-text-secondary mb-2">Note: {existing.reviewNote}</p>
          )}
          <p className="text-text-muted text-xs">
            You can re-apply 7 days after the denial.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          label="Why do you want to be a Creator?"
          htmlFor="motivation"
          error={errors.motivation?.message}
          hint="What kind of projects would you document? At least 40 characters."
          required
        >
          <textarea
            id="motivation"
            rows={6}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary"
            placeholder="I build..."
            {...register('motivation')}
          />
        </FormField>

        <FormField
          label="Experience (optional)"
          htmlFor="experience"
          error={errors.experience?.message}
          hint="Skills, tools, or background relevant to your projects."
        >
          <textarea
            id="experience"
            rows={3}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary"
            placeholder="Languages, platforms, years of experience..."
            {...register('experience')}
          />
        </FormField>

        <FormField
          label="Portfolio URL (optional)"
          htmlFor="portfolioUrl"
          error={errors.portfolioUrl?.message}
          hint="GitHub, personal site, or any link that shows your work."
        >
          <Input
            id="portfolioUrl"
            type="url"
            placeholder="https://"
            invalid={!!errors.portfolioUrl}
            {...register('portfolioUrl')}
          />
        </FormField>

        {errors.root && (
          <div
            className="rounded-button border border-error bg-error/5 px-3 py-2 text-sm text-error"
            role="alert"
          >
            {errors.root.message}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} size="lg">
          Submit application
        </Button>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}
