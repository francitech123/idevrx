import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Bookmark,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import { useLogout } from '@/features/auth/useAuth';
import { LogoMark } from '@/components/brand/LogoMark';

interface Props {
  open: boolean;
  onNavigate: () => void;
}

const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/following', label: 'Following', icon: Users },
  { to: '/library', label: 'Saved', icon: Bookmark },
  { to: '/learning-hub', label: 'Learning', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const LINK_GROUPS = [
  {
    label: 'Discover',
    links: [
      { to: '/explore', label: 'Explore' },
      { to: '/learning', label: 'Learning paths' },
      { to: '/challenges', label: 'Challenges' },
      { to: '/components', label: 'Components' },
      { to: '/tutorials', label: 'Tutorials' },
    ],
  },
  {
    label: 'Guides',
    links: [
      { to: '/creator-guidelines', label: 'Creator guide' },
      { to: '/community-guidelines', label: 'Community guide' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/help', label: 'Help' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { to: '/policies/privacy', label: 'Privacy Policy' },
      { to: '/policies/terms', label: 'Terms' },
      { to: '/policies/cookies', label: 'Cookies' },
    ],
  },
];

export function AppSidebar({ open, onNavigate }: Props) {
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await logout.mutateAsync();
    onNavigate();
    navigate('/');
  }

  return (
    <aside className={`app-side${open ? ' open' : ''}`}>
      <Link to="/home" className="app-side-logo" onClick={onNavigate}>
        <span className="app-side-logo-mark">
          <LogoMark size={22} />
        </span>
        <span className="app-side-logo-name">IDEVRX</span>
      </Link>

      <nav className="app-nav">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.to ||
            (item.to !== '/home' && pathname.startsWith(item.to + '/'));
          return (
            <button
              key={item.to}
              className={active ? 'on' : ''}
              onClick={() => {
                navigate(item.to);
                onNavigate();
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button className="lo" onClick={handleLogout}>
          <LogOut size={18} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
      </nav>

      <div className="app-links">
        {LINK_GROUPS.map((group) => (
          <div key={group.label}>
            <h4>{group.label}</h4>
            {group.links.map((l) => (
              <Link key={l.to} to={l.to} onClick={onNavigate}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
