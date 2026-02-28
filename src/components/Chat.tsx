import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/gemini';
import { Message } from './Message';
import { Camera, Bell, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraView } from './CameraView';
import { JourneyReview } from './JourneyReview';

const STORAGE_KEY = 'little_steps_messages';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    return [
      {
        id: '1',
        role: 'model',
        text: '안녕! 오늘 하루는 어땠어? 조금 지치거나 힘들다면 편하게 사진으로 이야기해줘. 지금 눈앞에 보이는 걸 찍어볼까?',
        timestamp: new Date().toISOString(),
      },
    ];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Periodic alarm simulation
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      handleAlarm();
    }, 1000 * 60 * 60); // Every 1 hour

    return () => clearInterval(alarmInterval);
  }, [messages]);

  const handleAlarm = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const alarmMessage = "[알람] 시간이 꽤 지났네요. 유저가 잘 쉬고 있는지, 혹은 아주 작은 퀘스트(Lv.1)를 하나 제안해볼까요? 너무 부담스럽지 않게요.";
    
    try {
      const responseText = await generateChatResponse(messages, alarmMessage);
      
      const newModelMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, newModelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async (dataUrl: string) => {
    setIsCameraOpen(false);
    setIsLoading(true);

    const mimeType = dataUrl.split(';')[0].split(':')[1];
    const base64Data = dataUrl.split(',')[1];

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      imageUrl: dataUrl,
      base64Data,
      mimeType,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    try {
      const responseText = await generateChatResponse(updatedMessages, undefined, base64Data, mimeType);
      
      const newModelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, newModelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '앗, 뭔가 문제가 생겼어. 조금 이따가 다시 시도해볼까?',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    if (window.confirm('오늘의 대화를 마치고 새로운 여정을 시작할까요?')) {
      const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: '새로운 시작이야! 오늘도 너의 속도대로 천천히 걸어가보자. 지금 기분은 어때? 사진으로 보여줄래?',
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMsg]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <AnimatePresence>
        {isCameraOpen && (
          <CameraView 
            onCapture={handleCapture} 
            onClose={() => setIsCameraOpen(false)} 
          />
        )}
        {isReviewOpen && (
          <JourneyReview 
            messages={messages} 
            onClose={() => setIsReviewOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">작은 한 걸음</h1>
            <p className="text-[11px] text-slate-500">사진으로 대화하는 너의 동반자</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleAlarm}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
            title="알람 시뮬레이션"
          >
            <Bell size={20} />
          </button>
          <button 
            onClick={resetSession}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="세션 초기화"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-6 z-10 flex flex-col gap-3">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCameraOpen(true)}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
          >
            <Camera size={24} />
            사진 찍어서 대답하기
          </motion.button>
          
          <button
            onClick={() => setIsReviewOpen(true)}
            className="w-full py-3 text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            오늘의 여정 돌아보기
          </button>
        </div>
      </div>
    </div>
  );
}

