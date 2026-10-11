export function ComponentsPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Components</div>
      <h1>Component knowledge base</h1>

      <p>
        The IDEVRX component knowledge base connects the parts, tools, and
        technologies used across projects into a shared engineering reference.
      </p>

      <h2>What it will include</h2>
      <ul>
        <li>Reusable records for common components (ESP32, Arduino, sensors).</li>
        <li>Projects that use each component, with the role it plays.</li>
        <li>Alternative and comparable components.</li>
        <li>Links to related engineering concepts and learning paths.</li>
      </ul>

      <h2>Coming soon</h2>
      <p>
        The component knowledge layer is part of a future release. Once live,
        each component page will let you jump from a part to the projects that
        use it.
      </p>

      <h2>Project components</h2>
      <p>
        Every published project already lists its required components in the
        project's components section. This is the foundation the knowledge base
        builds on.
      </p>
    </div>
  );
}
