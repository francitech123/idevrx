import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, Play, TrendingUp } from 'lucide-react';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  lessonCount: number;
}

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  lessonCount: number;
}

interface EnrolledCourse {
  course: Course;
  completedCount: number;
  totalLessons: number;
  percentComplete: number;
  certificateIssuedAt: string | null;
}

interface EnrolledPath {
  path: LearningPath;
  completedLessonIds: string[];
  totalLessons: number;
  completedCount: number;
}

type Tab = 'courses' | 'paths' | 'progress';

export function LearningHubPage() {
  const [tab, setTab] = useState<Tab>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [enrolledPaths, setEnrolledPaths] = useState<EnrolledPath[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? '';
    Promise.all([
      fetch(`${apiUrl}/api/v1/courses`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${apiUrl}/api/v1/learning-paths`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${apiUrl}/api/v1/me/courses/enrolled`, {
        credentials: 'include',
      }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${apiUrl}/api/v1/me/paths/enrolled`, {
        credentials: 'include',
      }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([c, p, ec, ep]) => {
        if (c?.success) setCourses(c.data.courses ?? []);
        if (p?.success) setPaths(p.data.paths ?? []);
        if (ec?.success) setEnrolledCourses(ec.data.items ?? []);
        if (ep?.success) setEnrolledPaths(ep.data.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#fff',
          borderRadius: 22,
          padding: 'clamp(24px, 4vw, 48px)',
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(24px, 3.6vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            maxWidth: '22ch',
            marginBottom: 12,
          }}
        >
          Learn engineering. Build your knowledge. Get certified.
        </h1>
        <p style={{ color: '#AAB8C4', maxWidth: '60ch', marginBottom: 20 }}>
          Structured courses for practical learners. Track progress, pass the
          assessment, and earn an IDEVRX certificate.
        </p>
        {courses[0] && (
          <button
            onClick={() => navigate(`/learning-hub/course/${courses[0].slug}`)}
            style={{
              padding: '11px 22px',
              background:
                'linear-gradient(135deg, #06B6D4 0%, #2563EB 55%, #7C3AED 100%)',
              color: '#fff',
              border: 0,
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Start with {courses[0].title}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {(
          [
            { key: 'courses', label: 'Courses' },
            { key: 'paths', label: 'Learning Paths' },
            { key: 'progress', label: 'Your Progress' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 4px',
              border: 0,
              background: 'none',
              borderBottom: tab === t.key ? '2px solid #2563EB' : '2px solid transparent',
              color: tab === t.key ? '#2563EB' : '#64748B',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 260,
                borderRadius: 16,
                background: '#E2E8F0',
              }}
            />
          ))}
        </div>
      )}

      {!loading && tab === 'courses' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {courses.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: 60,
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                borderRadius: 16,
                color: '#64748B',
              }}
            >
              <BookOpen size={28} style={{ marginBottom: 12 }} />
              <p>No courses available yet.</p>
            </div>
          )}
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}

      {!loading && tab === 'paths' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {paths.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: 60,
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                borderRadius: 16,
                color: '#64748B',
              }}
            >
              <p>No learning paths yet.</p>
            </div>
          )}
          {paths.map((p) => (
            <PathCard key={p.id} path={p} />
          ))}
        </div>
      )}

      {!loading && tab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {enrolledCourses.length === 0 && enrolledPaths.length === 0 && (
            <div
              style={{
                padding: 60,
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                borderRadius: 16,
                color: '#64748B',
              }}
            >
              <TrendingUp size={28} style={{ marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8, color: '#0F172A' }}>
                No progress yet
              </h3>
              <p style={{ marginBottom: 20 }}>
                Enroll in a course or learning path to track your progress.
              </p>
              <button
                onClick={() => setTab('courses')}
                style={{
