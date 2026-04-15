import React, { useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { FileText, Mic, Send, Paperclip, ChevronLeft } from "lucide-react";

export interface AITool {
  id?: string;
  name: string;
  description?: string;
  icon?: any;
  colorClass?: string;
}

const SUGGESTED_ACTIONS = [
  'Generate Quiz',
  'Summarize Notes',
  'Create Slides',
  'Explain Concepts',
];

export const UniversalAIInterface = ({ tool, onBack }: { tool: AITool, onBack: () => void }) => {
  const [messages, setMessages] = useState<{id: string, text: React.ReactNode, isAi: boolean}[]>([
    { id: 'init', text: `Hello! I'm your ${tool.name}. How can I assist you today?`, isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !isUploading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, isAi: false }]);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      let reply: React.ReactNode = "I've processed your request. Here is the generated content based on your input.";
      if (tool.name.includes('Quiz')) {
        reply = (
          <div className="space-y-3">
            <p>Here is a sample quiz question:</p>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <p className="font-bold text-slate-800 mb-3">Q: What is the powerhouse of the cell?</p>
              <div className="space-y-2">
                {['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'].map((opt, i) => (
                  <button key={i} className="w-full text-left p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      } else if (tool.name.includes('Slide')) {
        reply = (
          <div className="space-y-3">
            <p>I've structured a 3-slide outline for you:</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
               {[1, 2, 3].map(i => (
                 <div key={i} className="min-w-[150px] aspect-video bg-white border border-slate-200 rounded-xl shadow-sm p-3 snap-start flex flex-col justify-center">
                   <div className="h-2 w-12 bg-slate-200 rounded mb-2" />
                   <div className="h-1.5 w-full bg-slate-100 rounded mb-1" />
                   <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                 </div>
               ))}
            </div>
          </div>
        );
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), text: reply, isAi: true }]);
    }, 1500);
  };
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setMessages(prevMsg => [...prevMsg, { id: Date.now().toString(), text: (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Lecture_Notes.pdf</p>
                  <p className="text-xs text-slate-500">2.4 MB • Uploaded</p>
                </div>
              </div>
            ), isAi: false } as {id: string, text: React.ReactNode, isAi: boolean}]);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-100px)] w-[calc(100vw-100px)] max-h-[800px] bg-white rounded-[32px] border border-slate-200/60 shadow-xl overflow-hidden"
    >
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200/50 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {tool.icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tool.colorClass || 'border-indigo-200 text-indigo-500 bg-indigo-50'}`}>
            {React.createElement(tool.icon, { className: 'w-5 h-5' })}
          </div>
        )}
        <div>
          <h2 className="font-bold text-slate-900 leading-tight">{tool.name}</h2>
          {tool.description && <p className="text-xs font-medium text-slate-500">{tool.description}</p>}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${msg.isAi ? '' : 'flex-row-reverse'}`}
            >
              {msg.isAi && tool.icon && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tool.colorClass || 'border-indigo-200 text-indigo-500 bg-indigo-50'}`}>
                  {React.createElement(tool.icon, { className: 'w-4 h-4' })}
                </div>
              )}
              <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-sm font-medium shadow-sm ${
                msg.isAi 
                  ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' 
                  : 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-200'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              {tool.icon && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tool.colorClass || 'border-indigo-200 text-indigo-500 bg-indigo-50'} relative`}>
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin opacity-50" />
                  {React.createElement(tool.icon, { className: 'w-4 h-4' })}
                </div>
              )}
              <div className="px-5 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Bottom Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Smart Suggestions */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTED_ACTIONS.map(action => (
                <motion.button
                  key={action}
                  whileHover={{ y: -2 }}
                  onClick={() => setInput(action)}
                  className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-bold rounded-full border border-slate-200 transition-colors whitespace-nowrap shrink-0"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          )}
          {/* Upload Progress */}
          <AnimatePresence>
            {isUploading && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 overflow-hidden"
              >
                <div className="flex justify-between text-xs font-bold text-indigo-700 mb-2">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-3xl p-2 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-300 transition-all shadow-sm">
            <button 
              type="button" 
              onClick={simulateUpload}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Upload notes or ask the AI to generate material..."
              className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[44px] max-h-32 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button 
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-2xl transition-all shrink-0 ${isRecording ? 'text-rose-500 bg-rose-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl transition-colors shrink-0 shadow-md disabled:shadow-none"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          <div className="text-center text-[10px] font-medium text-slate-400">
            Supported formats: PDF, DOCX, Slides, Images, Notes
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalAIInterface;
