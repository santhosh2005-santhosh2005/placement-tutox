'use client';

// Utility functions for live transcription

export interface TranscriptUpdate {
  interim: string;
  final: string;
}

export async function requestCameraMic(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return stream;
  } catch (e) {
    console.error('getUserMedia failed', e);
    return null;
  }
}

export async function playAudioUrl(url: string): Promise<void> {
  const audio = new Audio(url);
  // @ts-ignore - playsInline is a valid property for HTMLAudioElement in some browsers
  audio.playsInline = true;
  try {
    await audio.play();
    return new Promise((resolve) => {
      const onEnded = () => {
        audio.removeEventListener('ended', onEnded);
        resolve();
      };
      audio.addEventListener('ended', onEnded, { once: true });
    });
  } catch (err: any) {
    if (err && err.name === 'AbortError') return; // ignore benign race
    console.error('audio play failed', err);
    throw err;
  }
}