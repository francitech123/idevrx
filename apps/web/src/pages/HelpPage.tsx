export function HelpPage() {
  return (
    <div className="idx-page">
      <div className="idx-eyebrow">Help</div>
      <h1>Help Center</h1>

      <h2>Getting started</h2>
      <p>
        Create an account to explore the full catalog and take part in the
        community. Registered users can browse, comment, and save projects.
      </p>

      <h2>Becoming a Creator</h2>
      <p>
        Creator access is granted to Registered Users who apply and are approved.
        Once approved, you can create, document, and publish engineering projects.
        Creator access is separate from Moderator or Admin roles.
      </p>

      <h2>Publishing a project</h2>
      <p>
        A complete project includes a title, description, category, difficulty,
        build time, and a cover image. Creators can add components, build steps,
        code samples, and downloadable files.
      </p>
      <p>
        Every published project receives a permanent number and a stable URL.
      </p>

      <h2>Uploading files</h2>
      <p>
        Files are stored in object storage. Each project can hold images, PDFs,
        CAD files, code archives, and other documentation. Files are downloaded
        through temporary signed URLs, and downloads can be enabled or disabled
        per file.
      </p>

      <h2>Version history</h2>
      <p>
        Projects can evolve. Meaningful engineering changes should create a new
        project version, so the history of a build remains clear.
      </p>

      <h2>Reporting a problem</h2>
      <p>
        If you encounter a technical issue, please include a screenshot and any
        error messages you saw. This helps us investigate quickly.
      </p>
    </div>
  );
}
