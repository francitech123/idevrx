import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await registerMutation.mutateAsync(values);
      navigate('/', { replace: true });
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
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Create your account</h1>
      <p className="text-sm text-text-secondary mb-8">
        Join IDEVRX as a learner and community member.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Display name"
          htmlFor="displayName"
          error={errors.displayName?.message}
          required
        >
          <Input
            id="displayName"
            autoComplete="name"
            invalid={!!errors.displayName}
            {...register('displayName')}
          />
        </FormField>

        <FormField
          label="Username"
          htmlFor="username"
          error={errors.username?.message}
          hint="Letters, numbers, underscores."
          required
        >
          <Input
            id="username"
            autoComplete="username"
            invalid={!!errors.username}
            {...register('username')}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 10 characters, with upper, lower, and a number."
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register('password')}
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

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
