import React from 'react';
import { motion } from 'motion/react';
import { Clock, Book, CheckCircle } from 'lucide-react';

interface RoadmapItem {
  day: string;
  topic: string;
  description: string;
  tasks: string[];
}

export interface RoadmapData {
  title: string;
  roadmap: RoadmapItem[];
}

interface RoadmapTimelineProps {
  data: RoadmapData;
}

export function RoadmapTimeline({ data }: RoadmapTimelineProps) {
  return (
    <div 
      className="bg-slate-900 border-2 border-indigo-500/30 p-4 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      
      <h3 className="text-2xl font-black text-amber-400 mb-8 font-display uppercase tracking-widest relative z-10 flex items-center gap-3">
        <span className="bg-amber-500/20 text-amber-500 p-2 rounded-xl"><Book className="w-6 h-6" /></span>
        {data.title}
      </h3>
      
      <div className="space-y-6 relative z-10">
        {data.roadmap.map((item, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex gap-4 sm:gap-6 relative group"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg border border-indigo-400 shrink-0 relative z-10">
                {index + 1}
              </div>
              {index < data.roadmap.length - 1 && (
                <div className="w-1 h-full bg-indigo-500/30 my-2 rounded-full" />
              )}
            </div>
            
            <div className="pb-8 flex-1 min-w-0">
              <div className="bg-slate-800 border border-slate-700 p-5 sm:p-6 rounded-2xl shadow-lg w-full transition duration-300 hover:border-indigo-500/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <span className="text-white font-black uppercase tracking-wider text-xs sm:text-sm bg-indigo-500 px-3 py-1.5 rounded-lg shrink-0 inline-flex items-center">
                    {item.day}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-amber-300 truncate whitespace-normal leading-tight">{item.topic}</h4>
                </div>
                
                <div className="text-sm text-slate-300 mt-2 mb-5 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    <CheckCircle className="w-3 h-3" /> CHAPTER OVERVIEW
                  </span>
                  {item.description}
                </div>
                
                <div className="bg-black/60 p-4 sm:p-5 rounded-xl border border-slate-700/50">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Book className="w-4 h-4 text-indigo-400" /> STUDY MATERIAL & TASKS
                  </h5>
                  <ul className="space-y-3">
                    {item.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="text-sm font-semibold text-emerald-50 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
