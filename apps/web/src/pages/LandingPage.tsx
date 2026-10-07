import { Link } from 'react-router-dom';
import { usePublicProjects } from '@/features/projects/useProjects';
import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/project/ProjectCard';
import {
  Bot, Cpu, Code2, Wifi, Box, Eye, Zap, Terminal,
} from 'lucide-react';

const JOURNEY = [
  { label: 'Idea', fail: false },
  { label: 'Design', fail: false },
  { label: 'Plan', fail: false },
  { label: 'Build', fail: false },
  { label: 'Fail', fail: true },
  { label: 'Diagnose', fail: false },
  { label: 'Improve', fail: false },
  { label: 'Test', fail: false },
  { label: 'Document', fail: false },
  { label: 'Share', fail: false },
  { label: 'Remix', fail: false },
  { label: 'Version', fail: false },
];

const PLATFORM_ITEMS = [
  { n: '01', t: 'Discover', d: 'Find projects by engineering relevance — category, components, difficulty, cost, and creator.' },
  { n: '02', t: 'Learn', d: 'Tutorials and learning paths that connect theory to practical, documented builds.' },
  { n: '03', t: 'Build', d: 'Structured drafts: BOM, steps, code, schematics, files, and tests — progressively documented.' },
  { n: '04', t: 'Share', d: 'Publish with permanent project numbers, galleries, YouTube embeds, and downloadable files.' },
  { n: '05', t: 'Improve', d: 'Version history, remix lineage, technical discussion, and documented lessons.' },
];

const DOMAINS = [
  { label: 'Robotics', slug: 'robotics', icon: Bot },
  { label: 'Electronics', slug: 'electronics', icon: Cpu },
  { label: 'Embedded systems', slug: 'embedded-systems', icon: Code2 },
  { label: 'IoT', slug: 'iot-automation', icon: Wifi },
  { label: '3D fabrication', slug: '3d-design-fabrication', icon: Box },
  { label: 'Computer vision', slug: 'computer-vision', icon: Eye },
  { label: 'Automation', slug: 'iot-automation', icon: Zap },
  { label: 'Programming', slug: 'programming', icon: Terminal },
];

interface Stats {
  projects: number;
  creators: number;
  files: number;
}

function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiUrl = import.meta.env.VITE_API_URL ?? '';

    fetch(`${apiUrl}/api/v1/stats`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!cancelled && body && body.success && body.data) {
          setStats(body.data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

export function LandingPage() {
  const stats = useStats();
  const { data } = usePublicProjects({ limit: 3 });
  const featured = data?.items ?? [];

  return (
    // ... rest of the file unchanged
