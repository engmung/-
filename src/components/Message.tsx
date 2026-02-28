import React from 'react';
import { ChatMessage } from '../types';
import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';

interface MessageProps {
  key?: React.Key;
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const isModel = message.role === 'model';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isModel ? 'bg-emerald-100 text-emerald-600 mr-2' : 'bg-slate-100 text-slate-600 ml-2'}`}>
          {isModel ? <Bot size={18} /> : <User size={18} />}
        </div>
        
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isModel
                ? 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'
                : 'bg-emerald-500 text-white shadow-sm rounded-tr-none'
            }`}
          >
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-w-full h-auto rounded-xl mb-2 object-cover max-h-48"
                referrerPolicy="no-referrer"
              />
            )}
            {message.text && (
              <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.text}</p>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
