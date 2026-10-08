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
      <div style={{ padding: 40, color: '#64748B' }}>Loading course...</div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Course not found</h2>
        <Link
          to="/learning-hub"
          style={{ color: '#2563EB', textDecoration: 'none' }}
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
          border: '1px solid #E2E8F0',
          background: '#fff',
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> All courses
      </button>

      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#fff',
          borderRadius: 22,
          padding: 'clamp(24px, 4vw, 44px)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#67E8F9',
            marginBottom: 12,
          }}
        >
          {course.category || 'COURSE'}
        </div>
        <h1
          style={{
            fontSize: 'clamp(24px, 3.6vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            marginBottom: 12,
          }}
        >
          {course.title}
        </h1>
        <p style={{ color: '#AAB8C4', maxWidth: '60ch', marginBottom: 20 }}>
          {course.description}
        </p>

        {!course.enrollment.enrolled && (
          <button
            onClick={enroll}
            disabled={actionBusy}
            style={{
              padding: '11px 22px',
              background:
                'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
              color: '#fff',
              border: 0,
              borderRadius: 10,
              fontWeight: 600,
              cursor: actionBusy ? 'wait' : 'pointer',
              fontFamily: 'inherit',
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
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 99,
                overflow: 'hidden',
                marginBottom: 10,
                maxWidth: 400,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background:
                    'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#AAB8C4' }}>
              {course.enrollment.completedCount} of {course.enrollment.totalLessons} lessons · {percent}%
            </div>
            {course.enrollment.certificateIssuedAt && (
              <div
                style={{
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: 'rgba(22, 163, 74, 0.15)',
                  color: '#4ADE80',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 600,
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
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Curriculum
        </h2>

        {course.lessons.length === 0 && (
          <p style={{ color: '#64748B' }}>No lessons in this course yet.</p>
        )}

        {course.lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              padding: '13px 0',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {lesson.completed ? (
                <CheckCircle2 size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
              ) : (
                <Circle size={20} style={{ color: '#CBD5E1', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {lesson.order}. {lesson.title}
                </div>
                {lesson.description && (
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
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
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: actionBusy ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Mark complete
              </button>
            )}
            {lesson.completed && (
              <span
                style={{
                  fontSize: 12,
                  color: '#16A34A',
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
            <div style={{ marginTop: 20 }}>
              <button
                onClick={passAssessment}
                disabled={actionBusy}
                style={{
                  padding: '11px 22px',
                  background: '#16A34A',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: actionBusy ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
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
