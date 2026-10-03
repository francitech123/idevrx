import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { FileUploader } from '@/components/file/FileUploader';
import { FileCard } from '@/components/file/FileCard';
import { ApiRequestError } from '@/api/client';
import { useCurrentUser, isCreator } from '@/features/auth/useAuth';
import {
  useProject,
  useCategories,
  useUpdateProject,
  usePublishProject,
  useUnpublishProject,
  useDeleteProject,
} from '@/features/projects/useProjects';
import { useProjectFiles, useDeleteFile, useDownloadFile } from '@/features/files/useFiles';

const schema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().max(500).optional().default(''),
  description: z.string().max(20000).optional().default(''),
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
  version: z.string().max(32).optional().default('v0.1'),
});
type FormValues = z.infer<typeof schema>;

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useCurrentUser();
  const { data: project, isLoading: projectLoading, isError } = useProject(id);
  const { data: categoriesData } = useCategories();
  const updateProject = useUpdateProject();
  const publishProject = usePublishProject();
  const unpublishProject = useUnpublishProject();
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data: filesData } = useProjectFiles(project?.id);
  const deleteFile = useDeleteFile(project?.id ?? '');
  const downloadFile = useDownloadFile(project?.id ?? '');
  const files = filesData ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      shortDescription: '',
      description: '',
      categoryId: '',
      difficulty: '',
      estimatedCost: '',
      estimatedBuildTime: '',
      youtubeUrl: '',
      version: 'v0.1',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        shortDescription: project.shortDescription,
        description: project.description,
        categoryId: project.categoryId ?? '',
        difficulty: project.difficulty ?? '',
        estimatedCost: project.estimatedCost != null ? String(project.estimatedCost) : '',
        estimatedBuildTime: project.estimatedBuildTime ?? '',
        youtubeUrl: project.youtubeUrl ?? '',
        version: project.version,
      });
    }
  }, [project, reset]);

  if (authLoading || projectLoading) {
    return (
      <div className="max-w-reading mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isCreator(user)) return <Navigate to="/creator/apply" replace />;
  if (isError || !project) {
    return (
      <div className="max-w-reading mx-auto px-6 py-16 text-center">
        <p className="text-sm font-mono text-text-muted mb-2">404</p>
        <h1 className="text-2xl font-bold mb-3">Project not found</h1>
        <Link to="/studio">
          <Button>Back to Studio</Button>
        </Link>
      </div>
    );
  }

  if (project.authorId !== user.id) {
    return (
      <div className="max-w-reading mx-auto px-6 py-16 text-center">
        <p className="text-sm font-mono text-text-muted mb-2">403</p>
        <h1 className="text-2xl font-bold mb-3">Not your project</h1>
        <Link to="/studio">
          <Button>Back to Studio</Button>
        </Link>
      </div>
    );
  }

  const isLive = project.status === 'published' || project.status === 'updated';

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setActionMessage(null);
    try {
      await updateProject.mutateAsync({
        id: project!.id,
        patch: {
          title: values.title,
          shortDescription: values.shortDescription || '',
          description: values.description || '',
          categoryId: values.categoryId || null,
          difficulty: values.difficulty ? (values.difficulty as any) : null,
          estimatedCost:
            values.estimatedCost && !isNaN(Number(values.estimatedCost))
              ? Number(values.estimatedCost)
              : null,
          estimatedBuildTime: values.estimatedBuildTime || '',
          youtubeUrl: values.youtubeUrl || '',
          version: values.version || 'v0.1',
        },
      });
      setActionMessage('Saved.');
    } catch (err) {
      setServerError(err instanceof ApiRequestError ? err.message : 'Save failed.');
    }
  }

  async function handlePublish() {
    setServerError(null);
    setActionMessage(null);
    try {
      await publishProject.mutateAsync(project!.id);
      setActionMessage('Published.');
    } catch (err) {
      setServerError(err instanceof ApiRequestError ? err.message : 'Publish failed.');
    }
  }

  async function handleUnpublish() {
    setServerError(null);
    setActionMessage(null);
    try {
      await unpublishProject.mutateAsync(project!.id);
      setActionMessage('Unpublished.');
    } catch (err) {
      setServerError(err instanceof ApiRequestError ? err.message : 'Unpublish failed.');
    }
  }

  async function handleDelete() {
    if (!confirm('Remove this project? This cannot be undone from the UI.')) return;
    setServerError(null);
    try {
      await deleteProject.mutateAsync(project!.id);
      navigate('/studio');
    } catch (err) {
      setServerError(err instanceof ApiRequestError ? err.message : 'Delete failed.');
    }
  }

  const categories = categoriesData ?? [];
  const publicUrl = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-xs font-mono text-brand-primary mb-1">
            PROJECT {String(project.projectNumber).padStart(3, '0')} · {project.status}
          </p>
          <h1 className="text-2xl font-bold">Edit project</h1>
        </div>
        <div className="flex gap-2">
          {isLive && (
            <Link to={publicUrl} target="_blank">
              <Button variant="ghost" size="md">View public</Button>
            </Link>
          )}
          {isLive ? (
            <Button variant="secondary" size="md" onClick={handleUnpublish} loading={unpublishProject.isPending}>
              Unpublish
            </Button>
          ) : (
            <Button size="md" onClick={handlePublish} loading={publishProject.isPending}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-button border border-success bg-success/5 px-3 py-2 text-sm text-success mb-4">
          {actionMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6" noValidate>
        <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
          <Input id="title" invalid={!!errors.title} {...register('title')} />
        </FormField>

        <FormField label="Short description" htmlFor="shortDescription" error={errors.shortDescription?.message}>
          <Input id="shortDescription" {...register('shortDescription')} />
        </FormField>

        <FormField
          label="Full description"
          htmlFor="description"
          error={errors.description?.message}
          hint="At least 50 characters required to publish."
        >
          <textarea
            id="description"
            rows={10}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm"
            {...register('description')}
          />
        </FormField>

        <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
          <select
            id="categoryId"
            className="h-10 w-full rounded-input border border-border bg-surface px-3 text-sm"
            {...register('categoryId')}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
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
          <FormField label="Estimated cost" htmlFor="estimatedCost" hint="USD">
            <Input id="estimatedCost" type="number" min="0" {...register('estimatedCost')} />
          </FormField>
          <FormField label="Build time" htmlFor="estimatedBuildTime">
            <Input id="estimatedBuildTime" {...register('estimatedBuildTime')} />
          </FormField>
        </div>

        <FormField label="YouTube URL" htmlFor="youtubeUrl" error={errors.youtubeUrl?.message}>
          <Input id="youtubeUrl" invalid={!!errors.youtubeUrl} {...register('youtubeUrl')} />
        </FormField>

        <FormField label="Version" htmlFor="version" hint="e.g. v0.1, v1.0, v2.0">
          <Input id="version" {...register('version')} />
        </FormField>

        {serverError && (
          <div className="rounded-button border border-error bg-error/5 px-3 py-2 text-sm text-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} size="lg">
            Save changes
          </Button>
          <Link to="/studio">
            <Button type="button" variant="ghost" size="lg">
              Back to Studio
            </Button>
          </Link>
        </div>
      </form>

      <div className="mt-12 pt-6 border-t border-border">
        <h2 className="text-xl font-bold mb-4">Files</h2>

        <FileUploader projectRef={project.id} />

        <div className="mt-4 space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-text-muted py-4">
              No files uploaded yet. Add images, CAD files, code, or documents.
            </p>
          ) : (
            files.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                onDownload={(file) => downloadFile.mutate(file)}
                onDelete={(file) => {
                  if (confirm(`Delete "${file.originalFilename}"? This cannot be undone.`)) {
                    deleteFile.mutate(file.id);
                  }
                }}
                downloading={downloadFile.isPending}
                deleting={deleteFile.isPending}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <p className="text-xs text-text-muted mb-3">
          Danger zone. This removes the project from public view. It cannot be undone from the UI.
        </p>
        <Button variant="danger" size="md" onClick={handleDelete} loading={deleteProject.isPending}>
          Remove project
        </Button>
      </div>
    </div>
  );
}
