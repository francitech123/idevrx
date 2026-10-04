// 2. Upload directly to storage using the presigned URL
await new Promise<void>((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', intent.uploadUrl, true);

  // Send ONLY the headers the signed URL requires
  // The API returns them; if we send extra or missing headers, storage returns 403
  xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

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
