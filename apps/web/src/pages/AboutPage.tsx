export function AboutPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">About</div>
      <h1>About IDEVRX</h1>
      <p>
        IDEVRX is an engineering-focused project platform where people discover,
        document, reproduce, learn from, improve, and remix real-world technical projects.
      </p>
      <p>
        Robotics is where we start. Not where we end.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li>Engineering failures are legitimate project information.</li>
        <li>Reproducibility is more valuable than popularity.</li>
        <li>Projects are living records — they evolve through versions.</li>
        <li>Attribution matters. Remixes credit their source.</li>
      </ul>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 40 }}>
        Full content coming soon.
      </p>
    </div>
  );
}
