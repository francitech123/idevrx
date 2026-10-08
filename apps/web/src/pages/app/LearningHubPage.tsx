import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';

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
                  padding: '10px 20px',
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
                Browse courses
              </button>
            </div>
          )}

          {enrolledCourses.map((e) => (
            <div
              key={e.course.id}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#2563EB',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    COURSE
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                    {e.course.title}
                  </h3>
                </div>
                {e.certificateIssuedAt && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      background: '#F0FDF4',
                      color: '#16A34A',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Award size={14} />
                    Certified
                  </div>
                )}
              </div>
              <div
                style={{
                  height: 6,
                  background: '#E2E8F0',
                  borderRadius: 99,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${e.percentComplete}%`,
                    background: '#2563EB',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: '#64748B',
                  marginBottom: 12,
                }}
              >
                <span>
                  {e.completedCount} of {e.totalLessons} lessons
                </span>
                <span>{e.percentComplete}%</span>
              </div>
              <button
                onClick={() => navigate(`/learning-hub/course/${e.course.slug}`)}
                style={{
                  padding: '9px 18px',
                  background: '#2563EB',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                }}
              >
                {e.percentComplete > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
          ))}

          {enrolledPaths.map((e) => (
            <div
              key={e.path.id}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                LEARNING PATH
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                {e.path.title}
              </h3>
              <div
                style={{
                  height: 6,
                  background: '#E2E8F0',
                  borderRadius: 99,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${
                      e.totalLessons > 0
                        ? Math.round((e.completedCount / e.totalLessons) * 100)
                        : 0
                    }%`,
                    background: '#2563EB',
                  }}
                />
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {e.completedCount} of {e.totalLessons} lessons
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();
  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '16/10',
          background: 'linear-gradient(135deg, #2457F5 0%, #6A3DF0 100%)',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
        }}
      >
        <BookOpen size={48} opacity={0.4} />
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {course.lessonCount} lessons
        </span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
          {course.title}
        </h3>
        <p style={{ fontSize: 13, color: '#475569', marginBottom: 14, flex: 1 }}>
          {course.description}
        </p>
        <button
          onClick={() => navigate(`/learning-hub/course/${course.slug}`)}
          style={{
            padding: '9px 18px',
            background: '#2563EB',
            color: '#fff',
            border: 0,
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
          }}
        >
          Open course
        </button>
      </div>
    </article>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#2563EB',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {path.category || 'LEARNING PATH'}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {path.title}
      </h3>
      <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
        {path.description}
      </p>
      <div
        style={{
          fontSize: 12,
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <CheckCircle2 size={14} /> {path.lessonCount} lessons
      </div>
    </article>
  );
}
