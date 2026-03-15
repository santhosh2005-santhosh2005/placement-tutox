// getMedia.ts
export async function requestCameraMic(): Promise<MediaStream|null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return stream;
  } catch (err) {
    console.error("Media permission error", err);
    return null;
  }
}