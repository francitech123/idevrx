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
          background: 'var(--color-ink)',
          color: 'var(--color-paper)',
          borderRadius: 12,
          padding: 'clamp(24px, 4vw, 48px)',
          marginBottom: 32,
          border: '1px solid var(--color-line)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            maxWidth: '22ch',
            marginBottom: 12,
            color: 'var(--color-paper)',
          }}
        >
          Learn engineering. Build your knowledge. Get certified.
        </h1>
        <p
          style={{
            color: 'rgba(246, 241, 231, 0.75)',
            maxWidth: '60ch',
            marginBottom: 22,
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
          }}
        >
          Structured courses for practical learners. Track progress, pass the
          assessment, and earn an IDEVRX certificate.
        </p>
        {courses[0] && (
          <button
            onClick={() => navigate(`/learning-hub/${courses[0].slug}`)}
            style={{
              padding: '11px 22px',
              background: 'var(--color-accent)',
              color: 'var(--color-on-ink)',
              border: 0,
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Start with {courses[0].title}
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 24,
          borderBottom: '1px solid var(--color-line)',
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
              padding: '10px 0',
              border: 0,
              background: 'none',
              borderBottom:
                tab === t.key
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              color:
                tab === t.key ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
              fontFamily: 'var(--font-sans)',
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
                borderRadius: 10,
                background: 'var(--color-paper-muted)',
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
                border: '1px dashed var(--color-line-strong)',
                borderRadius: 10,
                color: 'var(--color-muted)',
                background: 'var(--color-card)',
              }}
            >
              <BookOpen size={28} style={{ marginBottom: 12 }} />
              <p style={{ fontFamily: 'var(--font-sans)' }}>
                No courses available yet.
              </p>
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
                border: '1px dashed var(--color-line-strong)',
                borderRadius: 10,
                color: 'var(--color-muted)',
                background: 'var(--color-card)',
              }}
            >
              <p style={{ fontFamily: 'var(--font-sans)' }}>
                No learning paths yet.
              </p>
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
                border: '1px dashed var(--color-line-strong)',
                borderRadius: 10,
                color: 'var(--color-muted)',
                background: 'var(--color-card)',
              }}
            >
              <TrendingUp size={28} style={{ marginBottom: 12 }} />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: 'var(--color-ink)',
                }}
              >
                No progress yet
              </h3>
              <p
                style={{
                  marginBottom: 22,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-muted)',
                }}
              >
                Enroll in a course or learning path to track your progress.
              </p>
              <button
                onClick={() => setTab('courses')}
                style={{
                  padding: '11px 22px',
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-ink)',
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
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
                background: 'var(--color-card)',
                border: '1px solid var(--color-line)',
                borderRadius: 10,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: 6,
                    }}
                  >
                    Course
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: '-0.012em',
                      marginBottom: 4,
                      color: 'var(--color-ink)',
                    }}
                  >
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
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
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
                  background: 'var(--color-paper-muted)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${e.percentComplete}%`,
                    background: 'var(--color-accent)',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--color-muted)',
                  marginBottom: 14,
                }}
              >
                <span>
                  {e.completedCount} of {e.totalLessons} lessons
                </span>
                <span>{e.percentComplete}%</span>
              </div>
              <button
                onClick={() => navigate(`/learning-hub/${e.course.slug}`)}
                style={{
                  padding: '9px 18px',
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-ink)',
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
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
                background: 'var(--color-card)',
                border: '1px solid var(--color-line)',
                borderRadius: 10,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: 6,
                }}
              >
                Learning Path
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '-0.012em',
                  marginBottom: 14,
                  color: 'var(--color-ink)',
                }}
              >
                {e.path.title}
              </h3>
              <div
                style={{
                  height: 6,
                  background: 'var(--color-paper-muted)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  marginBottom: 10,
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
                    background: 'var(--color-accent)',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--color-muted)',
                }}
              >
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
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '3 / 2',
          background: 'var(--color-ink)',
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-paper)',
        }}
      >
        <BookOpen size={48} opacity={0.35} />
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-paper)',
          }}
        >
          {course.lessonCount} lessons
        </span>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            marginBottom: 8,
            color: 'var(--color-ink)',
          }}
        >
          {course.title}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--color-muted)',
            marginBottom: 16,
            flex: 1,
            lineHeight: 1.55,
          }}
        >
          {course.description}
        </p>
        <button
          onClick={() => navigate(`/learning-hub/${course.slug}`)}
          style={{
            padding: '9px 18px',
            background: 'var(--color-accent)',
            color: 'var(--color-on-ink)',
            border: 0,
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
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
        background: 'var(--color-card)',
        border: '1px solid var(--color-line)',
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: 10,
        }}
      >
        {path.category || 'Learning Path'}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.012em',
          marginBottom: 8,
          color: 'var(--color-ink)',
        }}
      >
        {path.title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-muted)',
          marginBottom: 14,
          lineHeight: 1.55,
        }}
      >
        {path.description}
      </p>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--color-muted)',
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
