import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize } from 'lucide-react';

interface Props {
  youtubeUrl: string | null;
  projectNumber: number;
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    const v = u.searchParams.get('v');
    if (v) return v;
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] ?? null;
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] ?? null;
    return null;
  } catch {
    return null;
  }
}

export function ProjectVideoPlayer({ youtubeUrl, projectNumber }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoId = youtubeUrl ? youtubeId(youtubeUrl) : null;

  useEffect(() => {
    if (!videoId || !playing) return;
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 1 }),
        '*'
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [videoId, playing]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.origin.includes('youtube.com')) return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
            if (data.info.duration) setDuration(data.info.duration);
            if (data.info.duration) {
              setProgress((data.info.currentTime / data.info.duration) * 100);
            }
          }
          if (data.info.playerState === 0) setPlaying(false);
        }
      } catch {}
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function togglePlay() {
    if (!videoId) return;
    setPlaying((p) => !p);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * duration;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
      '*'
    );
    setCurrentTime(newTime);
    setProgress(ratio * 100);
  }

  function fullscreen() {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current.requestFullscreen?.().catch(() => {});
  }

  function fmt(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  if (!videoId) {
    return (
      <div
        style={{
          aspectRatio: '16/9',
          borderRadius: 12,
          background: 'var(--color-ink)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-paper)',
          fontSize: 14,
          marginBottom: 26,
          fontFamily: 'var(--font-sans)',
          opacity: 0.85,
        }}
      >
        No video for this project
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&playsinline=1`;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        aspectRatio: '16/9',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000',
        marginBottom: 26,
        maxHeight: '78vh',
      }}
    >
      {playing ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={`Project ${projectNumber} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      ) : (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(26, 22, 18, 0.15) 0%, rgba(26, 22, 18, 0.7) 100%)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '3%',
              bottom: '8%',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(90px, 19vw, 280px)',
              lineHeight: 1,
              letterSpacing: '-0.05em',
              color: 'rgba(246, 241, 231, 0.14)',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {String(projectNumber).padStart(3, '0')}
          </span>
          <button
            type="button"
            aria-label="Play video"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 'clamp(56px, 8vw, 88px)',
              height: 'clamp(56px, 8vw, 88px)',
              borderRadius: '50%',
              border: 0,
              background: 'var(--color-paper)',
              color: 'var(--color-ink)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Play size={28} fill="currentColor" />
          </button>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '34px clamp(12px, 2vw, 24px) 12px',
          background:
            'linear-gradient(transparent, rgba(26, 22, 18, 0.85))',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            border: 0,
            background: 'none',
            color: 'var(--color-paper)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 6,
          }}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div
          onClick={seek}
          role="slider"
          aria-label="Seek"
          tabIndex={0}
          style={{
            flex: 1,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 4,
              borderRadius: 999,
              background: 'rgba(246, 241, 231, 0.3)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress}%`,
                borderRadius: 999,
                background: 'var(--color-accent)',
              }}
            />
          </div>
        </div>

        <span
          style={{
            fontSize: 12,
            color: 'var(--color-paper)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          {fmt(currentTime)} / {fmt(duration || 0)}
        </span>

        <button
          type="button"
          onClick={fullscreen}
          aria-label="Fullscreen"
          style={{
            border: 0,
            background: 'none',
            color: 'var(--color-paper)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 6,
          }}
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
