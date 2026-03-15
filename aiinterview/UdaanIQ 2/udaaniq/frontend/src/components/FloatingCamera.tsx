// FloatingCamera.tsx
import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { safelyAttachStream } from "../utils/floatingCameraUtils";

export default function FloatingCamera({ stream, onClose, onMuteToggle }:{
  stream: MediaStream|null, onClose:()=>void, onMuteToggle:(muted:boolean)=>void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null); // <- nodeRef to avoid findDOMNode
  const [muted,setMuted]=useState(false);
  const [size,setSize]=useState<'small'|'large'>(()=>localStorage.getItem('camSize') as 'small'|'large' || 'small');
  const [pos,setPos]=useState(() => {
    try { return JSON.parse(localStorage.getItem('camPos') || 'null') || undefined; } catch { return undefined; }
  });

  useEffect(()=>{ safelyAttachStream(videoRef.current, stream); return ()=>{/* cleanup handled by parent */} },[stream]);

  const toggleSize = () => {
    const next = size === 'small' ? 'large' : 'small';
    setSize(next);
    localStorage.setItem('camSize', next);
  };

  const handleDragStop = (_e:any, data:any) => {
    localStorage.setItem('camPos', JSON.stringify({ x: data.x, y: data.y }));
    setPos({ x: data.x, y: data.y });
  };

  // IMPORTANT: pass nodeRef to Draggable and attach it to the element
  return stream ? (
    <Draggable
      bounds="body"
      nodeRef={nodeRef}
      defaultPosition={pos}
      onStop={handleDragStop}
    >
      <div
        ref={nodeRef}
        role="dialog"
        aria-label="Camera preview"
        onDoubleClick={toggleSize}
        style={{
          position: 'fixed', zIndex: 1200,
          width: size === 'small' ? 160 : 320,
          height: size === 'small' ? 120 : 240,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          background: '#000', touchAction: 'none'
        }}
      >
        <video ref={videoRef} muted={muted} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button 
            aria-label={muted ? 'Unmute' : 'Mute'} 
            onClick={() => { 
              setMuted(m => !m); 
              onMuteToggle(!muted); 
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {muted ? '🔇' : '🎙️'}
          </button>
          <button 
            aria-label="Close camera" 
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✖
          </button>
        </div>
      </div>
    </Draggable>
  ) : null;
}