import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (isCaptured || error) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCaptured, error]);

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setIsCaptured(true);
      }
    }
  };

  const retake = () => {
    setIsCaptured(false);
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p>{error}</p>
            <button 
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-white text-black rounded-full"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            {!isCaptured ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedImage!}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <button
            onClick={onClose}
            className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
          >
            <X size={24} />
          </button>

          {!isCaptured && !error && (
            <div className={`px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 font-mono text-lg font-bold ${timeLeft <= 10 ? 'bg-red-500/60 text-white animate-pulse' : 'bg-black/40 text-emerald-400'}`}>
              <div className={`w-2 h-2 rounded-full ${timeLeft <= 10 ? 'bg-white' : 'bg-emerald-400'} animate-ping`} />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
          
          {!isCaptured && !error && (
            <button
              onClick={toggleCamera}
              className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
            >
              <RefreshCw size={24} />
            </button>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-10 flex justify-center items-center gap-12 bg-gradient-to-t from-black/60 to-transparent">
          {!isCaptured ? (
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-white/30 flex items-center justify-center active:scale-90 transition-transform shadow-2xl"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10" />
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex flex-col items-center gap-2 text-white group"
              >
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-full group-hover:bg-white/30 transition-colors">
                  <RefreshCw size={28} />
                </div>
                <span className="text-sm font-medium">다시 찍기</span>
              </button>
              
              <button
                onClick={confirm}
                className="flex flex-col items-center gap-2 text-white group"
              >
                <div className="p-4 bg-emerald-500 rounded-full group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                  <Check size={28} />
                </div>
                <span className="text-sm font-medium">보내기</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
