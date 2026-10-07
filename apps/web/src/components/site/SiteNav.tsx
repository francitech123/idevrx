import { Link, NavLink } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/features/auth/useAuth';
import { Wordmark } from '@/components/brand/Wordmark';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SiteNav() {
  const { user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  }

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/');
  }

  return (
    <nav className="idx-nav">
      <div className="idx-container idx-nav-inner">
        <Link to="/" className="idx-nav-logo" aria-label="IDEVRX home">
          <Wordmark />
        </Link>

        <div className="idx-nav-links">
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/learning">Learning</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/challenges">Challenges</NavLink>
        </div>

        <form className="idx-nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search projects, creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search projects and creators"
          />
        </form>

        <div className="idx-nav-actions">
          {user ? (
            <>
              <Link to="/settings" className="idx-btn idx-btn-outline">
                {user.displayName}
              </Link>
              <button className="idx-btn idx-btn-primary" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="idx-btn idx-btn-outline">Sign In</Link>
              <Link to="/register" className="idx-btn idx-btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
