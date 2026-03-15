'use client';

import { useEffect, useRef, useState } from 'react';

interface AIAvatarProps {
  text: string;
  avatarVideoUrl?: string | null;
  audioUrl?: string | null;
  onSpeechEnd?: () => void;
}

export default function AIAvatar({ text, avatarVideoUrl, audioUrl, onSpeechEnd }: AIAvatarProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!text) return;

    async function speakQuestion() {
      setIsSpeaking(true);

      // If we have a pre-rendered avatar video, play that
      if (avatarVideoUrl) {
        const video = videoRef.current;
        if (video) {
          try {
            video.src = avatarVideoUrl;
            await video.play();
            video.onended = () => {
              setIsSpeaking(false);
              onSpeechEnd?.();
            };
          } catch (err) {
            console.error('Avatar video play error', err);
            // Fallback to audio if video fails
            playAudioFallback();
          }
        }
        return;
      }

      // If we have pre-generated audio, play that
      if (audioUrl) {
        playAudioFallback();
        return;
      }

      // Otherwise, fallback to browser TTS
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = speechSynthesis.getVoices().find(v => v.lang.includes('en')) || null;
      utter.pitch = 1;
      utter.rate = 1;
      utter.onend = () => {
        setIsSpeaking(false);
        onSpeechEnd?.();
      };
      speechSynthesis.speak(utter);
    }

    speakQuestion();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [text, avatarVideoUrl, audioUrl]);

  const playAudioFallback = async () => {
    if (!audioUrl) {
      // Fallback to browser TTS if no audio URL
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = speechSynthesis.getVoices().find(v => v.lang.includes('en')) || null;
      utter.pitch = 1;
      utter.rate = 1;
      utter.onend = () => {
        setIsSpeaking(false);
        onSpeechEnd?.();
      };
      speechSynthesis.speak(utter);
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        onSpeechEnd?.();
      };
      
      await audio.play();
    } catch (err) {
      console.error('Audio play error', err);
      // Final fallback to browser TTS
      const utter = new SpeechSynthesisUtterance(text);
      utter.voice = speechSynthesis.getVoices().find(v => v.lang.includes('en')) || null;
      utter.pitch = 1;
      utter.rate = 1;
      utter.onend = () => {
        setIsSpeaking(false);
        onSpeechEnd?.();
      };
      speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {avatarVideoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-48 h-48 rounded-full shadow-lg object-cover"
        />
      ) : (
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 shadow-lg flex items-center justify-center ${
            isSpeaking ? 'animate-pulse' : ''
          }`}
        >
          <span className="text-white font-bold text-2xl">AI</span>
        </div>
      )}

      <div className="mt-4 px-4 py-2 bg-white rounded-lg shadow">
        <p className="text-center text-gray-800 font-medium">{text}</p>
      </div>
    </div>
  );
}