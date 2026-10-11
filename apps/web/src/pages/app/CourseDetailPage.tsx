import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Circle } from 'lucide-react';

interface Lesson {
  id: string;
  order: number;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
}

interface CourseData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  lessons: Lesson[];
  enrollment: {
    enrolled: boolean;
    completedCount: number;
    totalLessons: number;
    passedAssessmentAt: string | null;
    certificateIssuedAt: string | null;
  };
}

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  function load() {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    fetch(`${apiUrl}/api/v1/courses/${slug}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then((body) => {
        if (body.success) setCourse(body.data.course);
        else setError('Course not found');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function enroll() {
    if (!course) return;
    setActionBusy(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      await fetch(`${apiUrl}/api/v1/courses/${course.id}/enroll`, {
        method: 'POST',
        credentials: 'include',
      });
      load();
    } finally {
      setActionBusy(false);
    }
  }

  async function toggleLesson(lesson: Lesson) {
    if (!course) return;
    if (lesson.completed) return;
    setActionBusy(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      await fetch(
        `${apiUrl}/api/v1/courses/${course.id}/lessons/${lesson.id}/complete`,
        { method: 'POST', credentials: 'include' }
      );
      load();
    } finally {
      setActionBusy(false);
    }
  }

  async function passAssessment() {
    if (!course) return;
    setActionBusy(true);
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    try {
      await fetch(`${apiUrl}/api/v1/courses/${course.id}/assessment/pass`, {
        method: 'POST',
        credentials: 'include',
      });
      load();
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 500,
            marginBottom: 14,
            color: 'var(--color-ink)',
          }}
        >
          Course not found
        </h2>
        <Link
          to="/learning-hub"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
          }}
        >
          Back to Learning Hub
        </Link>
      </div>
    );
  }

  const percent =
    course.enrollment.totalLessons > 0
      ? Math.round(
          (course.enrollment.completedCount / course.enrollment.totalLessons) * 100
        )
      : 0;

  const allLessonsDone =
    course.enrollment.completedCount === course.enrollment.totalLessons &&
    course.enrollment.totalLessons > 0;

  return (
    <div>
      <button
        onClick={() => navigate('/learning-hub')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          border: '1px solid var(--color-line)',
          background: 'var(--color-card)',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 22,
          color: 'var(--color-ink)',
        }}
      >
        <ArrowLeft size={14} /> All courses
      </button>

      <div
        style={{
          background: 'var(--color-ink)',
          color: 'var(--color-paper)',
          borderRadius: 12,
          padding: 'clamp(24px, 4vw, 44px)',
          marginBottom: 26,
          border: '1px solid var(--color-line)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 14,
          }}
        >
          {course.category || 'Course'}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            marginBottom: 14,
            color: 'var(--color-paper)',
          }}
        >
          {course.title}
        </h1>
        <p
          style={{
            color: 'rgba(246, 241, 231, 0.75)',
            maxWidth: '60ch',
            marginBottom: 22,
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {course.description}
        </p>

        {!course.enrollment.enrolled && (
          <button
            onClick={enroll}
            disabled={actionBusy}
            style={{
              padding: '11px 22px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              border: 0,
              borderRadius: 6,
              fontWeight: 600,
              cursor: actionBusy ? 'wait' : 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {actionBusy ? 'Enrolling...' : 'Enroll in course'}
          </button>
        )}

        {course.enrollment.enrolled && (
          <div>
            <div
              style={{
                height: 6,
                background: 'rgba(246, 241, 231, 0.15)',
                borderRadius: 999,
                overflow: 'hidden',
                marginBottom: 12,
                maxWidth: 400,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: 'var(--color-accent)',
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'rgba(246, 241, 231, 0.75)',
              }}
            >
              {course.enrollment.completedCount} of {course.enrollment.totalLessons} lessons · {percent}%
            </div>
            {course.enrollment.certificateIssuedAt && (
              <div
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: 'rgba(63, 110, 74, 0.25)',
                  color: '#A0D9A8',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <Award size={14} /> Certificate issued
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          padding: 22,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            marginBottom: 18,
            color: 'var(--color-ink)',
          }}
        >
          Curriculum
        </h2>

        {course.lessons.length === 0 && (
          <p
            style={{
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            No lessons in this course yet.
          </p>
        )}

        {course.lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: '1px solid var(--color-line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {lesson.completed ? (
                <CheckCircle2
                  size={20}
                  style={{ color: 'var(--color-success)', flexShrink: 0 }}
                />
              ) : (
                <Circle
                  size={20}
                  style={{ color: 'var(--color-line-strong)', flexShrink: 0 }}
                />
              )}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--color-ink)',
                  }}
                >
                  {lesson.order}. {lesson.title}
                </div>
                {lesson.description && (
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      color: 'var(--color-muted)',
                      marginTop: 2,
                    }}
                  >
                    {lesson.description}
                  </div>
                )}
              </div>
            </div>
            {course.enrollment.enrolled && !lesson.completed && (
              <button
                onClick={() => toggleLesson(lesson)}
                disabled={actionBusy}
                style={{
                  padding: '7px 14px',
                  border: '1px solid var(--color-line-strong)',
                  background: 'var(--color-paper)',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: actionBusy ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-ink)',
                }}
              >
                Mark complete
              </button>
            )}
            {lesson.completed && (
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-success)',
                  fontWeight: 600,
                }}
              >
                Completed
              </span>
            )}
          </div>
        ))}

        {course.enrollment.enrolled &&
          allLessonsDone &&
          !course.enrollment.passedAssessmentAt && (
            <div style={{ marginTop: 22 }}>
              <button
                onClick={passAssessment}
                disabled={actionBusy}
                style={{
                  padding: '11px 22px',
                  background: 'var(--color-success)',
                  color: 'var(--color-on-ink)',
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: actionBusy ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {actionBusy ? 'Submitting...' : 'Pass assessment & get certificate'}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
