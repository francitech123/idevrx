import { Link } from 'react-router-dom';
import type { ProjectListItem } from '@/features/projects/projectApi';

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const url = `/ide/project-${String(project.projectNumber).padStart(3, '0')}/${project.slug}`;
  const meta = [
    `PROJECT ${String(project.projectNumber).padStart(3, '0')}`,
    project.difficulty ? project.difficulty.toUpperCase() : null,
    project.estimatedBuildTime ? `EST. ${project.estimatedBuildTime.toUpperCase()}` : null,
  ].filter(Boolean) as string[];

  return (
    <Link to={url} className="idx-project-card">
      <div className="idx-project-image">
        <span className="idx-project-version">{project.version}</span>
      </div>
      <div className="idx-project-body">
        <div className="idx-project-meta">
          {meta.map((m, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span>·</span>}
              <span className={i === 0 ? 'num' : undefined}>{m}</span>
            </span>
          ))}
        </div>
        <h3 className="idx-project-title">{project.title}</h3>
        {project.shortDescription && (
          <p className="idx-project-desc">{project.shortDescription}</p>
        )}
        <div className="idx-project-author">
          <span className="idx-project-author-avatar" />
          <span>Creator</span>
        </div>
        <div className="idx-project-tags">
          <span className="idx-project-tag">PROJECT</span>
        </div>
        <div className="idx-project-footer">
          <div className="idx-project-stats">
            <span>♥ {project.counts.likes}</span>
            <span>💬 {project.counts.comments}</span>
            <span>📁 {project.counts.bookmarks}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
