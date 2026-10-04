async uploadFile(
  projectRef: string,
  file: File,
  category: FileCategory,
  onProgress?: (percent: number) => void
): Promise<ProjectFile> {
  const intent = await fileApi.createUploadIntent(projectRef, {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    category,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', intent.uploadUrl, true);

    // CRITICAL: Send ONLY the headers returned by the signed URL.
    // Do NOT add any other headers (no manual Content-Type, no credentials).
    const headers = intent.headers ?? {};
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });

  return fileApi.finalize(projectRef, intent.fileId);
}
