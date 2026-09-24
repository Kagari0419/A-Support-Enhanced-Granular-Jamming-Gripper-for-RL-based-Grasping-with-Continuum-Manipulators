const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
}));

// This Site serves complete MP4 responses to byte-range requests. A local
// object URL makes the entire timeline seekable in the native video controls.
async function prepareSeekableVideo(video) {
  const source = video.querySelector('source');
  if (!source) return;

  const status = document.createElement('span');
  status.className = 'video-loading';
  status.textContent = 'Preparing video for seeking…';
  video.insertAdjacentElement('afterend', status);
  video.controls = false;

  let objectUrl;
  try {
    const response = await fetch(source.src, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Video download failed');
    const data = await response.blob();
    if (!data.size) throw new Error('Empty video');

    objectUrl = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
    const ready = new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });
    video.src = objectUrl;
    video.load();
    await ready;
    status.remove();
  } catch {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    video.removeAttribute('src');
    video.load();
    status.textContent = 'Video playback available; seeking may require loading';
    setTimeout(() => status.remove(), 5000);
  } finally {
    video.controls = true;
  }
}

videos.forEach(prepareSeekableVideo);
const copyButton = document.getElementById('copy-citation');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('bibtex').textContent);
    copyButton.textContent = 'Copied';
  } catch {
    copyButton.textContent = 'Select text to copy';
  }
  setTimeout(() => { copyButton.textContent = 'Copy BibTeX'; }, 2200);
});
