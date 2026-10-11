export function CommunityPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Community</div>
      <h1>Community</h1>

      <p>
        IDEVRX is a serious engineering platform. Community features exist to
        support learning, technical discussion, and constructive feedback.
      </p>

      <h2>What's coming</h2>
      <ul>
        <li>Comments and replies on projects.</li>
        <li>Following creators and receiving activity updates.</li>
        <li>Challenges and submissions.</li>
        <li>Reporting tools and moderation workflows.</li>
        <li>Structured discussion tied to specific projects.</li>
      </ul>

      <h2>Community standards</h2>
      <p>
        Contributions should be technical, respectful, and grounded in the work
        being discussed. Harassment, spam, and plagiarism are not tolerated.
      </p>
      <p>
        See our{' '}
        <a
          href="/community-guidelines"
          style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          community guidelines
        </a>{' '}
        for full details.
      </p>

      <h2>Get started</h2>
      <p>
        Create an account to like, bookmark, comment, and follow creators as
        community features become available.
      </p>
    </div>
  );
}
