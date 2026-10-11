import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { FileUploader } from '@/components/file/FileUploader';
import { FileList } from '@/components/file/FileList';

const schema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().max(500).optional().default(''),
  description: z.string().max(20000).optional().default(''),
  categoryId: z.string().optional().default(''),
  difficulty: z
    .enum(['', 'beginner', 'intermediate', 'advanced', 'expert'])
    .optional()
    .default(''),
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
        estimatedCost:
          project.estimatedCost != null ? String(project.estimatedCost) : '',
        estimatedBuildTime: project.estimatedBuildTime ?? '',
        youtubeUrl: project.youtubeUrl ?? '',
        version: project.version,
      });
    }
  }, [project, reset]);

  if (authLoading || projectLoading) {
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
  if (!isCreator(user)) return <Navigate to="/creator/apply" replace />;
  if (isError || !project) {
    return (
      <div className="idx-page" style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginBottom: 12,
          }}
        >
          404
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 500,
            marginBottom: 20,
            color: 'var(--color-ink)',
          }}
        >
          Project not found
        </h1>
        <Link
          to="/studio"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Back to Studio
        </Link>
      </div>
    );
  }

  if (project.authorId !== user.id) {
    return (
      <div className="idx-page" style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginBottom: 12,
          }}
        >
          403
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 500,
            marginBottom: 20,
            color: 'var(--color-ink)',
          }}
        >
          Not your project
        </h1>
        <Link
          to="/studio"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Back to Studio
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
      setServerError(
        err instanceof ApiRequestError ? err.message : 'Unpublish failed.'
      );
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
    <div className="idx-page" style={{ maxWidth: 900 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: 8,
            }}
          >
            PROJECT {String(project.projectNumber).padStart(3, '0')} · {project.status}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
            }}
          >
            Edit project
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isLive && (
            <Link
              to={publicUrl}
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '9px 16px',
                border: '1px solid var(--color-line-strong)',
                background: 'var(--color-card)',
                color: 'var(--color-ink)',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            >
              View public
            </Link>
          )}
          {isLive ? (
            <button
              onClick={handleUnpublish}
              disabled={unpublishProject.isPending}
              style={{
                padding: '9px 16px',
                border: '1px solid var(--color-line-strong)',
                background: 'var(--color-card)',
                color: 'var(--color-ink)',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: unpublishProject.isPending ? 'wait' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {unpublishProject.isPending ? 'Unpublishing...' : 'Unpublish'}
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishProject.isPending}
              style={{
                padding: '9px 20px',
                background: 'var(--color-accent)',
                color: 'var(--color-on-ink)',
                border: 0,
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
                cursor: publishProject.isPending ? 'wait' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {publishProject.isPending ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: '10px 14px',
            border: '1px solid var(--color-success)',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            borderRadius: 6,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            marginBottom: 20,
            marginTop: 16,
          }}
        >
          {actionMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 24 }}>
        <Field label="Title" htmlFor="title" error={errors.title?.message} required>
          <input
            id="title"
            {...register('title')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Short description"
          htmlFor="shortDescription"
          error={errors.shortDescription?.message}
        >
          <input
            id="shortDescription"
            {...register('shortDescription')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Full description"
          htmlFor="description"
          error={errors.description?.message}
          hint="At least 50 characters required to publish."
        >
          <textarea
            id="description"
            rows={10}
            {...register('description')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Category"
          htmlFor="categoryId"
          error={errors.categoryId?.message}
        >
          <select
            id="categoryId"
            {...register('categoryId')}
            className="idx-input"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Difficulty"
          htmlFor="difficulty"
          error={errors.difficulty?.message}
        >
          <select
            id="difficulty"
            {...register('difficulty')}
            className="idx-input"
          >
            <option value="">Not specified</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </Field>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 20,
          }}
          className="two-col"
        >
          <Field label="Estimated cost" htmlFor="estimatedCost" hint="USD">
            <input
              id="estimatedCost"
              type="number"
              min="0"
              {...register('estimatedCost')}
              className="idx-input"
            />
          </Field>
          <Field label="Build time" htmlFor="estimatedBuildTime">
            <input
              id="estimatedBuildTime"
              {...register('estimatedBuildTime')}
              className="idx-input"
            />
          </Field>
        </div>

        <Field
          label="YouTube URL"
          htmlFor="youtubeUrl"
          error={errors.youtubeUrl?.message}
        >
          <input
            id="youtubeUrl"
            {...register('youtubeUrl')}
            className="idx-input"
          />
        </Field>

        <Field
          label="Version"
          htmlFor="version"
          hint="e.g. v0.1, v1.0, v2.0"
        >
          <input id="version" {...register('version')} className="idx-input" />
        </Field>

        {serverError && (
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
            {serverError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            style={{
              padding: '12px 24px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              border: 0,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor:
                isSubmitting || !isDirty ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              opacity: !isDirty ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
          <Link
            to="/studio"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              border: '1px solid var(--color-line-strong)',
              background: 'var(--color-card)',
              color: 'var(--color-ink)',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Back to Studio
          </Link>
        </div>
      </form>

      <div
        style={{
          marginTop: 48,
          paddingTop: 32,
          borderTop: '1px solid var(--color-line)',
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: '-0.012em',
              marginBottom: 6,
              color: 'var(--color-ink)',
            }}
          >
            Files
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-muted)',
            }}
          >
            Upload images, PDFs, CAD files, code, and other project assets.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <FileUploader projectId={project.id} />
        </div>

        <FileList projectId={project.id} canEdit={true} />
      </div>

      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--color-line)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--color-muted)',
            marginBottom: 12,
          }}
        >
          Danger zone. This removes the project from public view. It cannot be undone from the UI.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleteProject.isPending}
          style={{
            padding: '9px 18px',
            background: 'transparent',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error)',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: deleteProject.isPending ? 'wait' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {deleteProject.isPending ? 'Removing...' : 'Remove project'}
        </button>
      </div>

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
        @media (max-width: 600px) {
          .two-col { grid-template-columns: 1fr !important; }
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
