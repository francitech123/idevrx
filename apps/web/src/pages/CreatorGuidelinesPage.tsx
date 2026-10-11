export function CreatorGuidelinesPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Creator Guidelines</div>
      <h1>Creator Guidelines</h1>

      <p>
        Creator access is the only role authorized to publish engineering
        projects on IDEVRX. These guidelines define what makes a project
        complete, reproducible, and useful to other builders.
      </p>

      <h2>Who can be a Creator</h2>
      <p>
        Creator access is granted to Registered Users who apply and are
        approved. Creator status is separate from Moderator, Admin, and CEO
        roles. Only the Creator role can author and publish engineering
        projects.
      </p>

      <h2>What a Creator can do</h2>
      <ul>
        <li>Create project drafts and edit them over time.</li>
        <li>Upload images, CAD files, code, schematics, PDFs, and archives.</li>
        <li>Add a YouTube URL for the project video.</li>
        <li>Document components, build steps, testing, and lessons learned.</li>
        <li>Publish projects under the platform's publishing rules.</li>
        <li>Create new versions as the project evolves.</li>
      </ul>

      <h2>What makes a good IDEVRX project</h2>
      <p>
        IDEVRX projects are structured engineering records, not marketing pages.
        A good project helps another builder understand what was built, why, how,
        what failed, what changed, and what remains uncertain.
      </p>
      <ul>
        <li>
          <b>Objective:</b> What did you set out to build, and why?
        </li>
        <li>
          <b>Components and tools:</b> What was actually used?
        </li>
        <li>
          <b>Steps:</b> How was it assembled, in what order?
        </li>
        <li>
          <b>Testing:</b> What did you check, and what did you observe?
        </li>
        <li>
          <b>Problems:</b> What failed, and what was the cause?
        </li>
        <li>
          <b>Lessons:</b> What would you change, and what would another builder
          need to know?
        </li>
      </ul>

      <h2>Progressive documentation</h2>
      <p>
        Not every project needs every field on day one. A draft can start
        minimal and grow. Published projects should have a title, description,
        and cover image at minimum. Reproducibility improves as more is added.
      </p>

      <h2>Failure is engineering data</h2>
      <p>
        Documented failures are one of the most valuable parts of an engineering
        record. Failed prototypes, incorrect component choices, mechanical
        problems, code bugs, sensor issues, and design limitations all belong in
        the project if they help another builder learn.
      </p>

      <h2>Honesty and accuracy</h2>
      <p>
        Provide accurate information to the best of your knowledge. Clearly
        identify assumptions, limitations, known failures, and incomplete
        sections. If a measurement or result is uncertain, say so rather than
        presenting a guess as fact.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Respect copyright and licensing. Do not upload content you don't have
        the right to share. Credit sources and inspiration. Do not present
        another person's work as your own.
      </p>

      <h2>Safety</h2>
      <p>
        Some engineering work involves real risks — electrical, mechanical,
        thermal, chemical, high-voltage, and battery hazards. Document safety
        notes clearly where they apply. Do not present untested or dangerous
        instructions as safe.
      </p>

      <h2>What gets moderated</h2>
      <p>
        Published projects can be reported by any user. Moderators may hide,
        restrict, or remove content that violates community standards, and
        Admins may act on accounts where policy requires. Moderation is
        auditable.
      </p>
    </div>
  );
}
