// floatingCameraUtils.ts
let pendingPlay: Promise<void>|null = null;

export async function safelyAttachStream(videoEl: HTMLVideoElement|null, stream: MediaStream|null) {
  if (!videoEl) return;
  try {
    const prev = videoEl.srcObject as MediaStream|null;
    if (prev && prev !== stream) { 
      prev.getTracks().forEach(t=>t.stop()); 
      videoEl.srcObject = null; 
    }

    if (!stream) {
      try { videoEl.pause(); } catch {}
      videoEl.srcObject = null;
      return;
    }

    videoEl.srcObject = stream;

    pendingPlay = videoEl.play().then(()=>{ 
      pendingPlay = null; 
    }).catch(err=>{
      pendingPlay = null;
      if (err && err.name === 'AbortError') return; // benign; ignore
      console.error('Video play failed', err);
    });
  } catch (err) {
    console.error('safelyAttachStream error', err);
  }
}