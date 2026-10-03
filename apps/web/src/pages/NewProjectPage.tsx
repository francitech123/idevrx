import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { ApiRequestError } from '@/api/client';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import { useCategories, useCreateProject } from '@/features/projects/useProjects';

const schema = z.object({
  title: z.string().min(3, 'At least 3 characters').max(200),
  shortDescription: z.string().max(500).optional().default(''),
  categoryId: z.string().optional().default(''),
  difficulty: z.enum(['', 'beginner', 'intermediate', 'advanced', 'expert']).optional().default(''),
  estimatedCost: z.string().optional().default(''),
  estimatedBuildTime: z.string().max(100).optional().default(''),
  youtubeUrl: z
    .string()
    .max(500)
    .optional()
    .default('')
    .refine(
      (v) => !v || /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(v),
      'Must be a youtube.com or youtu.be URL'
    ),
});
type FormValues = z.infer<typeof schema>;

export function NewProjectPage() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data: categoriesData } = useCategories();
  const createProject = useCreateProject();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      shortDescription: '',
      categoryId: '',
      difficulty: '',
      estimatedCost: '',
      estimatedBuildTime: '',
      youtubeUrl: '',
    },
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isCreator(user)) return <Navigate to="/creator/apply" replace />;

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const project = await createProject.mutateAsync({
        title: values.title,
        shortDescription: values.shortDescription || '',
        categoryId: values.categoryId || null,
        difficulty: values.difficulty ? (values.difficulty as any) : null,
        estimatedCost:
          values.estimatedCost && !isNaN(Number(values.estimatedCost))
            ? Number(values.estimatedCost)
            : null,
        estimatedBuildTime: values.estimatedBuildTime || '',
        youtubeUrl: values.youtubeUrl || '',
      });
      navigate(`/studio/project/${project.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  }

  const categories = categoriesData ?? [];

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">New project</h1>
      <p className="text-text-secondary mb-8">
        Start a draft. You can save, edit, and publish later.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
          <Input id="title" placeholder="e.g. ESP32 Environmental Sensor" invalid={!!errors.title} {...register('title')} />
        </FormField>

        <FormField
          label="Short description"
          htmlFor="shortDescription"
          error={errors.shortDescription?.message}
          hint="One-line summary shown on cards and search results."
        >
          <Input id="shortDescription" invalid={!!errors.shortDescription} {...register('shortDescription')} />
        </FormField>

        <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
          <select
            id="categoryId"
            className="h-10 w-full rounded-input border border-border bg-surface px-3 text-sm"
            {...register('categoryId')}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Difficulty" htmlFor="difficulty" error={errors.difficulty?.message}>
          <select
            id="difficulty"
            className="h-10 w-full rounded-input border border-border bg-surface px-3 text-sm"
            {...register('difficulty')}
          >
            <option value="">Not specified</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estimated cost" htmlFor="estimatedCost" error={errors.estimatedCost?.message} hint="USD">
            <Input id="estimatedCost" type="number" min="0" {...register('estimatedCost')} />
          </FormField>

          <FormField label="Build time" htmlFor="estimatedBuildTime" error={errors.estimatedBuildTime?.message} hint="e.g. 1 weekend">
            <Input id="estimatedBuildTime" {...register('estimatedBuildTime')} />
          </FormField>
        </div>

        <FormField
          label="YouTube URL (optional)"
          htmlFor="youtubeUrl"
          error={errors.youtubeUrl?.message}
          hint="Must be a youtube.com or youtu.be URL. Not required."
        >
          <Input id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." invalid={!!errors.youtubeUrl} {...register('youtubeUrl')} />
        </FormField>

        {serverError && (
          <div className="rounded-button border border-error bg-error/5 px-3 py-2 text-sm text-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} size="lg">
            Create draft
          </Button>
        </div>
      </form>
    </div>
  );
}
