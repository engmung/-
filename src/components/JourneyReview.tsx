import React from 'react';
import { ChatMessage } from '../types';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, Share2 } from 'lucide-react';

interface JourneyReviewProps {
  messages: ChatMessage[];
  onClose: () => void;
}

export function JourneyReview({ messages, onClose }: JourneyReviewProps) {
  const userPhotos = messages.filter(m => m.role === 'user' && m.imageUrl);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-slate-800">나의 작은 여정</h2>
          <button className="p-2 -mr-2 text-slate-400 hover:text-emerald-500">
            <Share2 size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
              <Heart size={32} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">정말 고생 많았어!</h3>
            <p className="text-slate-500 leading-relaxed">
              오늘 네가 내디딘 작은 한 걸음들이 모여<br />
              이렇게 멋진 기록이 되었어.
            </p>
          </div>

          <div className="space-y-12 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-emerald-100">
            {userPhotos.length > 0 ? (
              userPhotos.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-1 w-10 h-10 bg-white border-4 border-emerald-50 rounded-full flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <img
                      src={msg.imageUrl}
                      alt="Journey step"
                      className="w-full aspect-square object-cover rounded-xl mb-3"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        Step {index + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                아직 기록된 사진이 없네.<br />내일은 작은 사진 하나 남겨볼까?
              </div>
            )}
          </div>

          <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-slate-700 italic mb-4">
              "완벽하지 않아도 괜찮아.<br />너는 이미 충분히 잘하고 있어."
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
            >
              내일 또 만나자
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
