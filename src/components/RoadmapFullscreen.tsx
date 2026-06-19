import React, { useEffect, useState } from 'react';
import { RoadmapTimeline, RoadmapData } from './RoadmapTimeline';
import { Loader2 } from 'lucide-react';

export default function RoadmapFullscreen() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const subject = params.get('subject');
        const classLevel = params.get('classLevel');

        if (!subject || !classLevel) {
          setError('No roadmap parameters found in URL. Please go back to the dashboard and try again, or ensure you are not blocking cookies.');
          setLoading(false);
          return;
        }

        let materials = [];
        try {
          const reqMats = localStorage.getItem('roadmap_req_materials');
          if (reqMats) {
            materials = JSON.parse(reqMats);
          } else {
            // Fallback to reading the raw chapter materials
            const allMatsStr = localStorage.getItem('school_chapter_materials');
            if (allMatsStr) {
               const allMats = JSON.parse(allMatsStr);
               materials = allMats.filter((m: any) => m.subject === subject && (!m.targetClass || m.targetClass === classLevel))
                                  .map((m: any) => ({ title: m.title, description: m.content || m.chapterName, type: m.materialType }));
            }
          }
        } catch (e) {}

        const payload = {
          subject,
          classLevel,
          materials
        };

        const response = await fetch('/api/gemini/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to generate roadmap from server.');
        }

        const data = await response.json();
        setRoadmap(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while generating the roadmap.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
        <h2 className="text-2xl font-black text-amber-400 tracking-widest uppercase">Analyzing Study Materials...</h2>
        <p className="text-zinc-400 mt-2 font-mono text-sm max-w-sm">
          Please wait while our AI curriculum expert maps out the perfect study plan using your dashboard resources.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase mb-4">Error</h2>
        <p className="text-zinc-400 font-mono text-sm">{error}</p>
        <button 
          onClick={() => window.close()} 
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-indigo-700 transition"
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-12 md:p-20 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full inline-block">
            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              AI-Generated Study Pathway
            </span>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-colors"
          >
            🖨️ Print Roadmap
          </button>
        </div>
        
        {roadmap && <RoadmapTimeline data={roadmap} />}
      </div>
    </div>
  );
}
