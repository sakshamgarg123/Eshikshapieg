/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Mic, MicOff, VideoOff, Send, Users, ChevronLeft, 
  ChevronRight, Sparkles, X, Palette, RotateCcw, MessageSquare, 
  Hand, Captions, Share2, MoreVertical, Volume2, VolumeX, Settings, 
  Info, BarChart3, Radio, HelpCircle, Laptop, Minimize2, CheckSquare
} from 'lucide-react';
import { LiveClass, Message } from '../types';

interface LiveClassSessionProps {
  session: LiveClass;
  role: 'teacher' | 'student';
  userName: string;
  onLeave: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar: string;
  micActive: boolean;
  videoActive: boolean;
  isSpeaking: boolean;
  handRaised: boolean;
}

export default function LiveClassSession({
  session,
  role,
  userName,
  onLeave,
  messages,
  onSendMessage
}: LiveClassSessionProps) {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [whiteboardColor, setWhiteboardColor] = useState('#6366f1'); // Indigo-500
  const [brushSize, setBrushSize] = useState(4);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [presentationActive, setPresentationActive] = useState(true);
  const [activeStageTab, setActiveStageTab] = useState<'slides' | 'whiteboard' | 'screenshare'>('slides');
  
  // Google Meet UI states
  const [showDrawer, setShowDrawer] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'chat' | 'people' | 'activities'>('chat');
  const [captionsActive, setCaptionsActive] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [captionLines, setCaptionLines] = useState<Array<{ sender: string; text: string }>>([]);
  const [isAudioListening, setIsAudioListening] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper for Speech Synthesis (Text-To-Speech) so students can listen
  const speakTeacher = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.rate = 0.95; // highly natural reading pace
      utterance.pitch = 0.95; // authoritative voice pitch for doctor/instructor
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cleanup speech synthesis on leave
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  // Local video stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Participants roster
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'teacher',
      name: role === 'teacher' ? userName : session.teacherName,
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      micActive: true,
      videoActive: true,
      isSpeaking: false,
      handRaised: false
    },
    {
      id: 'student-1',
      name: 'Aarav Sharma',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      micActive: false,
      videoActive: true,
      isSpeaking: false,
      handRaised: false
    },
    {
      id: 'student-2',
      name: 'Sanya Gupta',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      micActive: true,
      videoActive: true,
      isSpeaking: false,
      handRaised: false
    },
    {
      id: 'student-3',
      name: 'Ishaan Roy',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      micActive: false,
      videoActive: false,
      isSpeaking: false,
      handRaised: false
    },
    {
      id: 'student-4',
      name: 'Priya Patel',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      micActive: true,
      videoActive: false,
      isSpeaking: false,
      handRaised: false
    }
  ]);

  // Slides configuration
  const slides = [
    {
      title: "Core Wave-Particle Duality",
      bullets: [
        "Wave theory model explains continuous light-field interference patterns.",
        "Quantum mechanics reveals localized packet bundles carrying discrete Planck Energy (E=hf).",
        "Louis de Broglie proposed matter waves: Wavelength = h / Momentum."
      ]
    },
    {
      title: "De Broglie Matter Waves & Group Velocity",
      bullets: [
        "Diffraction demonstrated via electron beam reflections in Nickel crystals.",
        "Phase Velocity refers to propagation of individual wave components within bundle.",
        "Group Velocity carries physical envelope information, traveling at the particle's physical speed."
      ]
    },
    {
      title: "Wave Packet Superposition Formulas",
      bullets: [
        "A wave packet represents mathematical addition of discrete sinusoidal curves.",
        "Localized probability space satisfies Heisenberg's extreme Uncertainty constraints.",
        "Schrödinger formulation models statistical propagation across three-dimensional environments."
      ]
    }
  ];

  // Update current time clock
  useEffect(() => {
    const updateMeetTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' | ' + session.title.substring(0, 15) + '...');
    };
    updateMeetTime();
    const interval = setInterval(updateMeetTime, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Handle local camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupCamera() {
      if (videoActive) {
        try {
          const streamObj = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false // handle audio output muted locally to prevent microphonic echo
          });
          activeStream = streamObj;
          setLocalStream(streamObj);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = streamObj;
          }
        } catch (error) {
          console.warn('Real webcam blocked or unavailable. Falling back to graphical avatar.', error);
          setLocalStream(null);
        }
      } else {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoActive]);

  // Simulating online participants behavior (e.g. speaking toggle, raising hands)
  useEffect(() => {
    const speakInterval = setInterval(() => {
      setParticipants(prev => {
        return prev.map(p => {
          // Keep current actor status or randomize speaking
          if (p.id === 'teacher' && role === 'student' && presentationActive) {
            return { ...p, isSpeaking: Math.random() > 0.4 };
          }
          if (p.id !== 'teacher' && Math.random() > 0.8) {
            return { ...p, isSpeaking: !p.isSpeaking && p.micActive };
          }
          return { ...p, isSpeaking: p.isSpeaking ? Math.random() > 0.3 : false };
        });
      });
    }, 4000);

    return () => clearInterval(speakInterval);
  }, [role, presentationActive]);

  // Simulate Closed Captions dynamically aligned with class subject
  useEffect(() => {
    if (!captionsActive) return;

    const teacherLectures = [
      "Let's carefully calculate the momentum of the electron packet...",
      "Now notice how de Broglie's universal wavelength matches the crystal experimental spacing.",
      "The probability density represents the square magnitude of the wave function.",
      "By adjusting our wave group boundaries, the phase interference becomes beautifully sharp.",
      "Are there any questions on the stationary states model we just reviewed?"
    ];

    const interval = setInterval(() => {
      const activeSpeaker = participants.find(p => p.isSpeaking);
      const speakerName = activeSpeaker ? activeSpeaker.name : (role === 'student' ? session.teacherName : 'Aarav Sharma');
      const randomText = teacherLectures[Math.floor(Math.random() * teacherLectures.length)];

      setCaptionLines(prev => {
        const next = [...prev, { sender: speakerName, text: randomText }];
        return next.slice(-2); // keep only last 2 lines
      });

      // Audibly speak the teacher's caption if the student turned on the "audio" connection
      if (role === 'student' && isAudioListening && (speakerName === session.teacherName || activeSpeaker?.role === 'teacher')) {
        speakTeacher(randomText);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [captionsActive, participants, role, session, isAudioListening]);

  // Simulate automatic synced presentation slide changes for attending students
  useEffect(() => {
    if (role === 'student') {
      const interval = setInterval(() => {
        setCurrentSlide(prev => {
          const next = prev < slides.length ? prev + 1 : 1;
          const targetSlide = slides[next - 1];
          // Recite slide progression to student
          if (isAudioListening) {
            speakTeacher(`Notice current slide, ${targetSlide.title}. We are focusing on: ${targetSlide.bullets[0]}`);
          }
          return next;
        });
      }, 16000); // cycle slides every 16 seconds for active learning feeling
      return () => clearInterval(interval);
    }
  }, [role, isAudioListening]);

  // Whiteboard Canvas Draw implementations
  useEffect(() => {
    if (activeStageTab === 'whiteboard') {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 750;
        canvas.height = 450;
        
        // Paint whiteboard background
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Draw faint grid grid lines
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let j = 0; j < canvas.height; j += 30) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvas.width, j);
            ctx.stroke();
          }
        }
      }
    }
  }, [activeStageTab]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (role !== 'teacher') return; // Students can't write, read-only
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    isDrawingRef.current = true;
    lastPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || role !== 'teacher') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = whiteboardColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw safety helper grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 30) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  };

  // Scroll chat drawer
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showDrawer, drawerTab]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  // Switch Google Meet presentation styles
  const handleTogglePresent = () => {
    setPresentationActive(!presentationActive);
  };

  const handleMicStatus = () => {
    setMicActive(!micActive);
    setParticipants(prev => prev.map(p => {
      if (p.id === 'teacher' && role === 'teacher') return { ...p, micActive: !micActive };
      return p;
    }));
  };

  // Simple local hand raise trigger
  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
  };

  // Screen layout helpers
  const sharedActive = presentationActive;

  return (
    <div className="bg-[#111] text-zinc-100 h-screen w-full flex flex-col font-sans overflow-hidden select-none" id="google-meet-embedded">
      
      {/* Top Banner indicating Google Meet Status */}
      <div className="bg-[#1f2023] border-b border-white/10 py-2.5 px-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs font-medium shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-extrabold text-[12px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-sans font-black">GOOGLE MEET APPROVED</span>
            <span className="text-zinc-300 truncate max-w-xs">{session.title}</span>
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {session.meetLink ? (
            <div className="bg-black/50 border border-white/10 px-3 py-1 rounded-lg flex items-center space-x-2 text-[11px] font-mono">
              <span className="text-zinc-500 font-sans font-bold text-[9px] uppercase">Classroom Meet Link:</span>
              <span className="text-blue-400 font-bold tracking-tight select-all">{session.meetLink}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(session.meetLink || '');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className={`text-[9px] px-2 py-0.5 rounded uppercase font-black transition cursor-pointer ${
                  copiedLink ? 'bg-emerald-600 text-white' : 'bg-[#3c4043] hover:bg-[#4f5357] text-white/90'
                }`}
                title="Copy Google Meet Link"
              >
                {copiedLink ? '✓ Copied' : 'Copy'}
              </button>
              <a
                href={session.meetLink}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded uppercase font-black transition inline-flex items-center gap-1 cursor-pointer"
              >
                Launch Native Tab
              </a>
            </div>
          ) : (
            <span className="text-[10px] text-yellow-500/85 bg-yellow-950/40 border border-yellow-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
              No custom meet link configured
            </span>
          )}
          
          <div className="bg-black/30 border border-white/5 px-2 py-1 rounded text-[10px] font-mono text-zinc-400">
            PORT ID: 3000
          </div>
          <span className="text-zinc-400 font-mono text-[11px] hidden sm:block">{currentTime}</span>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Video + Collaboration Stage */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          
          {/* Main Stage Panel (Slides, Screen or Canvas) */}
          {sharedActive ? (
            <div className="flex-1 min-h-[420px] bg-[#202124] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Header inside stage tabs */}
              <div className="bg-[#1a1b1e] px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex space-x-1.5 p-1 bg-black/30 rounded-lg">
                  <button
                    onClick={() => setActiveStageTab('slides')}
                    className={`px-3 py-1.5 rounded-md text-xs font-black tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                      activeStageTab === 'slides' 
                        ? 'bg-[#3c4043] text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Concept Deck</span>
                  </button>
                  <button
                    onClick={() => setActiveStageTab('whiteboard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-black tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                      activeStageTab === 'whiteboard' 
                        ? 'bg-[#3c4043] text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-rose-400" />
                    <span>Live Board</span>
                  </button>
                  <button
                    onClick={() => setActiveStageTab('screenshare')}
                    className={`px-3 py-1.5 rounded-md text-xs font-black tracking-wide uppercase transition-all flex items-center space-x-1.5 ${
                      activeStageTab === 'screenshare' 
                        ? 'bg-[#3c4043] text-white shadow-sm' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-info text-blue-400" />
                    <span>Screen Share</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-[10px] font-mono">
                  {role === 'teacher' ? (
                    <span className="text-emerald-400 font-bold tracking-wider uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      You are Presenting Study Materials
                    </span>
                  ) : (
                    <span className="text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Watching {session.teacherName}'s Stream
                    </span>
                  )}
                </div>
              </div>

              {/* Central stage body */}
              <div className="flex-1 bg-black/60 relative flex items-center justify-center p-4">
                
                {activeStageTab === 'slides' && (
                  <div className="max-w-2xl w-full bg-[#1e1f22] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative">
                    <span className="absolute top-4 right-4 bg-black/50 border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded text-indigo-400 uppercase tracking-wider">
                      PAGE {currentSlide} OF {slides.length}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8ab4f8] block mb-2 font-mono">
                      📚 {session.subject} Study Deck — Grade {session.targetClass}
                    </span>

                    {/* Audio Connect prompt for student */}
                    {role === 'student' && (
                      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between bg-indigo-950/40 border border-indigo-900/50 p-2.5 rounded-xl gap-2">
                        <div className="flex items-center space-x-2">
                          <Volume2 className={`w-4 h-4 shrink-0 ${isAudioListening ? 'text-emerald-400 animate-bounce' : 'text-indigo-400'}`} />
                          <span className="text-[11px] text-zinc-300 font-medium">
                            {isAudioListening 
                              ? `🔊 Listening to ${session.teacherName}'s audio broadcast...`
                              : `🔇 Teacher's audio stream is ready. Unmute to listen live!`
                            }
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (!isAudioListening) {
                              setIsAudioListening(true);
                              speakTeacher(`Connected to ${session.teacherName}'s live audio stream. Tuning in now.`);
                            } else {
                              setIsAudioListening(false);
                              if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isAudioListening 
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                          }`}
                        >
                          {isAudioListening ? 'Mute' : 'Listen'}
                        </button>
                      </div>
                    )}

                    <h2 className="text-lg md:text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">
                      {slides[currentSlide - 1].title}
                    </h2>
                    <ul className="space-y-3">
                      {slides[currentSlide - 1].bullets.map((bullet, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start space-x-2.5 text-xs text-zinc-300 font-sans tracking-wide leading-relaxed"
                        >
                          <span className="w-5 h-5 bg-[#3c4043] rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Left & Right navigation for Teacher presenting */}
                    {role === 'teacher' && (
                      <div className="mt-6 pt-4 border-t border-white/10 flex justify-end space-x-2">
                        <button
                          disabled={currentSlide === 1}
                          onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                          className="p-1.5 bg-[#303134] hover:bg-zinc-700 disabled:opacity-30 rounded text-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          disabled={currentSlide === slides.length}
                          onClick={() => setCurrentSlide(prev => Math.min(slides.length, prev + 1))}
                          className="p-1.5 bg-[#303134] hover:bg-zinc-700 disabled:opacity-30 rounded text-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeStageTab === 'whiteboard' && (
                  <div className="w-full h-full flex flex-col p-2">
                    {role === 'teacher' && (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#202124] border border-white/10 px-4 py-2 rounded-xl mb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[11px] text-zinc-400">Color Palette:</span>
                          <div className="flex space-x-1">
                            {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#000000'].map((col) => (
                              <button
                                key={col}
                                onClick={() => setWhiteboardColor(col)}
                                className={`w-5 h-5 rounded-full border border-zinc-700 transition transform hover:scale-110 cursor-pointer ${
                                  whiteboardColor === col ? 'ring-2 ring-indigo-500 scale-105' : ''
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-zinc-400">Width:</span>
                            <input 
                              type="range" 
                              min="2" 
                              max="12" 
                              value={brushSize}
                              onChange={(e) => setBrushSize(parseInt(e.target.value))}
                              className="w-16 accent-indigo-500 rounded-lg cursor-pointer h-1 bg-[#3c4043]"
                            />
                            <span className="text-[10px] font-mono text-zinc-300 w-4">{brushSize}px</span>
                          </div>

                          <button
                            onClick={clearWhiteboard}
                            className="bg-[#303134] hover:bg-[#3c4043] text-red-400 px-2.5 py-1 rounded text-xs flex items-center space-x-1 cursor-pointer transition border border-white/5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Clear</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-white relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className={`block bg-white ${role === 'teacher' ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
                        id="meet-canvas"
                      />
                      {role !== 'teacher' && (
                        <div className="absolute top-2 right-2 bg-black/80 border border-white/10 text-white text-[10px] font-sans px-2.5 py-1 rounded backdrop-blur-sm shadow flex items-center justify-center space-x-1.5 leading-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Dr. Vance is writing board formula notes</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeStageTab === 'screenshare' && (
                  <div className="w-full max-w-xl bg-[#202124] rounded-2xl p-8 border border-white/5 text-center text-zinc-300 space-y-4">
                    <Laptop className="w-16 h-16 mx-auto text-sky-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">Full Screen Media Casting Active</h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        Casting direct browser windows and system audio outputs via WebRTC screen acquisition standard.
                      </p>
                    </div>
                    {role === 'teacher' && (
                      <button 
                        onClick={() => setActiveStageTab('slides')} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Stop Sharing Screen
                      </button>
                    )}
                  </div>
                )}

                {/* Teacher Picture-in-Picture floating view so student can always SEE the teacher */}
                {role === 'student' && (
                  <div className="absolute bottom-4 right-4 w-44 h-32 bg-[#1e1f22]/90 border-2 border-indigo-500 rounded-xl overflow-hidden shadow-2xl z-20 flex flex-col justify-between group transition-all duration-300 hover:scale-105 backdrop-blur-sm" id="floating-teacher-cam">
                    <div className="absolute inset-0 bg-[#25262b]">
                      <img 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=150&fit=crop" 
                        alt={session.teacherName} 
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          participants.find(p => p.id === 'teacher')?.isSpeaking ? 'scale-105 saturate-120' : 'scale-100 opacity-90'
                        }`}
                      />
                      {/* Active speaking border */}
                      {participants.find(p => p.id === 'teacher')?.isSpeaking && (
                        <div className="absolute inset-0 border border-emerald-500 animate-pulse rounded-xl" />
                      )}
                    </div>
                    {/* Speaker status visual indicators */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        participants.find(p => p.id === 'teacher')?.isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-zinc-400'
                      }`} />
                      <span className="uppercase text-[8px] tracking-wider text-zinc-300 font-bold">
                        {participants.find(p => p.id === 'teacher')?.isSpeaking ? 'Speaking' : 'Instructor'}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] font-extrabold text-white bg-black/80 px-2 py-1 rounded border border-white/5">
                      <span className="truncate">{session.teacherName}</span>
                      <span className="text-[7px] text-zinc-400 font-mono tracking-widest bg-white/5 px-1 rounded uppercase">Host</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* Meeting layout: Large grid of all participants when sharing is turned off */
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 min-h-[420px]">
              
              {/* Special Box for local attendee webcam */}
              <div className="bg-[#202124] border border-white/5 rounded-2xl relative overflow-hidden group shadow-lg flex flex-col justify-between">
                <div className="absolute inset-0 bg-[#303134] flex items-center justify-center z-0">
                  {videoActive ? (
                    <div className="w-full h-full relative">
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#3c4043] text-zinc-300">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 text-lg font-black shrink-0">
                        {userName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-mono font-bold tracking-wider text-zinc-400">CAMERA MUTED</span>
                    </div>
                  )}
                </div>

                {/* Top/Bottom HUD bar */}
                <span className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 z-10 flex items-center space-x-1.5 uppercase">
                  {!micActive && <MicOff className="w-3 h-3 text-red-500" />}
                  {micActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  <span>YOU</span>
                </span>
                
                <span className="absolute bottom-3 left-3 bg-black/70 px-2.5 py-1 rounded text-xs font-semibold z-10 border border-white/5 truncate max-w-[200px]">
                  {userName} {role === 'teacher' ? '(Presenter)' : '(Student)'}
                </span>

                {/* Hand raise floating badge */}
                {handRaised && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-md text-[10px] font-black z-10 flex items-center space-x-1 animate-bounce">
                    <Hand className="w-3 h-3 text-black fill-current" />
                    <span>HAND RAISED</span>
                  </div>
                )}
              </div>

              {/* Other remote students in the active meet roster */}
              {participants.filter(p => p.id !== 'teacher' || role !== 'teacher').map(student => (
                <div key={student.id} className="bg-[#202124] border border-white/5 rounded-2xl relative overflow-hidden group shadow-lg flex flex-col justify-between">
                  <div className="absolute inset-0 bg-[#303134] flex items-center justify-center">
                    {student.videoActive ? (
                      <div className="w-full h-full relative">
                        {student.isSpeaking && (
                          <div className="absolute inset-0 border-2 border-emerald-500 animate-pulse z-10 pointer-events-none rounded-2xl" />
                        )}
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#3c4043] text-zinc-300">
                        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center border border-white/10 text-lg font-black shrink-0">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-mono font-bold tracking-wider text-zinc-400">CAMERA MUTED</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 z-10 flex items-center space-x-1">
                    {!student.micActive ? (
                      <MicOff className="w-3 h-3 text-red-500" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${student.isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'}`} />
                    )}
                    <span className="text-[10px] uppercase">
                      {student.isSpeaking ? 'SPEAKING' : 'ATTENDING'}
                    </span>
                  </div>

                  <span className="absolute bottom-3 left-3 bg-black/70 px-2.5 py-1 rounded text-xs font-semibold z-10 border border-white/5 truncate max-w-[200px]">
                    {student.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Connected horizontal mini-participants strip when Slides presentation is active */}
          {sharedActive && (
            <div className="flex space-x-3 overflow-x-auto py-1 shrink-0 scrollbar-thin select-none">
              
              {/* Local Participant Box */}
              <div className="h-28 w-44 rounded-xl border border-white/5 bg-[#202124] shrink-0 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0">
                  {videoActive ? (
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#3c4043] text-zinc-400">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">
                        {userName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-zinc-300 z-10">
                  {!micActive ? <MicOff className="w-3 h-3 text-red-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold z-10 border border-white/5 max-w-[130px] truncate">
                  Me {handRaised && '✋'}
                </div>
              </div>

              {/* Other Attendees Strip */}
              {participants.filter(p => p.id !== 'teacher' || role !== 'teacher').map(student => (
                <div key={student.id} className="h-28 w-44 rounded-xl border border-white/5 bg-[#202124] shrink-0 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0">
                    {student.videoActive ? (
                      <div className="w-full h-full relative">
                        {student.isSpeaking && (
                          <div className="absolute inset-0 border border-emerald-500 animate-pulse z-10 rounded-xl" />
                        )}
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#3c4043] text-zinc-400">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-bold grow-0">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-zinc-300 z-10">
                    {!student.micActive ? (
                      <MicOff className="w-3 h-3 text-red-500" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${student.isSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'}`} />
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold z-10 border border-white/5 max-w-[130px] truncate">
                    {student.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scrolling Closed Caption overlay */}
          {captionsActive && captionLines.length > 0 && (
            <div className="bg-black/90 p-3 rounded-xl border border-white/5 flex flex-col space-y-1 justify-center shrink-0 z-10">
              <span className="text-[8px] uppercase tracking-wider text-amber-400 font-mono italic block select-none">Live Google Translate Captions:</span>
              {captionLines.map((line, ix) => (
                <div key={ix} className="text-xs md:text-sm text-zinc-300 font-sans leading-relaxed tracking-wide">
                  <span className="font-extrabold text-blue-400">{line.sender}:</span> "{line.text}"
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Tabbed Drawer: Chat, People & whiteboard launchers */}
        {showDrawer && (
          <div className="w-80 border-l border-white/5 bg-[#17181c] flex flex-col shrink-0 overflow-hidden z-10">
            
            {/* Drawer tabs selector */}
            <div className="flex items-center justify-between border-b border-white/5 bg-[#202124] p-1">
              <button
                onClick={() => setDrawerTab('chat')}
                className={`flex-1 py-3 text-center text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 ${
                  drawerTab === 'chat' 
                    ? 'bg-[#3c4043] text-white border-b-2 border-indigo-505' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setDrawerTab('people')}
                className={`flex-1 py-3 text-center text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 ${
                  drawerTab === 'people' 
                    ? 'bg-[#3c4043] text-white border-b-2 border-indigo-505' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>People</span>
              </button>
              <button
                onClick={() => setDrawerTab('activities')}
                className={`flex-1 py-3 text-center text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 ${
                  drawerTab === 'activities' 
                    ? 'bg-[#3c4043] text-white border-b-2 border-indigo-505' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4 text-pink-400" />
                <span>Deck</span>
              </button>
            </div>

            {/* Tab: Chat Drawer */}
            {drawerTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-black/30 px-4 py-2 border-b border-white/5 text-[10px] font-mono uppercase text-zinc-400">
                  Class Session messages are visible to everyone
                </div>
                
                {/* Scrollable messages container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                      No posts yet. Ask or answer questions in the Live Chat!
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-extrabold font-mono tracking-wide ${
                            msg.role === 'teacher' ? 'text-amber-400 font-black' : 'text-indigo-400'
                          }`}>
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] text-zinc-500">{msg.timestamp}</span>
                          {msg.role === 'teacher' && (
                            <span className="text-[8px] bg-amber-950 text-amber-300 border border-amber-900 px-1 rounded uppercase font-bold">
                              Teacher
                            </span>
                          )}
                        </div>
                        <p className="bg-white/5 text-zinc-200 text-xs p-2.5 rounded-xl border border-white/5 leading-relaxed break-words">
                          {msg.text}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Secure Meet-style Message Form */}
                <form onSubmit={handleSendChat} className="border-t border-white/5 p-3 bg-[#202124] flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Send a message to everyone..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: People list showing student pins */}
            {drawerTab === 'people' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono mb-2">
                  Participants ({participants.length + 1})
                </div>

                <div className="space-y-2">
                  {/* Local participant */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-505/20 uppercase">
                        ME
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">{userName}</span>
                        <span className="text-[8px] font-mono text-zinc-400 uppercase">{role === 'teacher' ? 'Host' : 'You'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {!micActive ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
                      {!videoActive ? <VideoOff className="w-3.5 h-3.5 text-red-400" /> : <Video className="w-3.5 h-3.5 text-[#8ab4f8]" />}
                    </div>
                  </div>

                  {/* Remote participants list */}
                  {participants.filter(p => p.id !== 'teacher' || role !== 'teacher').map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200 truncate max-w-[140px]">{student.name}</span>
                          <span className="text-[8px] font-mono text-zinc-400 uppercase">
                            {student.role === 'teacher' ? 'Teacher / Host' : 'Classmate'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {!student.micActive ? <MicOff className="w-3.5 h-3.5 text-zinc-500" /> : <Mic className="w-3.5 h-3.5 text-zinc-300" />}
                        {!student.videoActive ? <VideoOff className="w-3.5 h-3.5 text-zinc-500" /> : <Video className="w-3.5 h-3.5 text-zinc-300" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Activities quick presenter links */}
            {drawerTab === 'activities' && (
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="text-xs font-black tracking-widest text-[#8ab4f8] uppercase font-mono mb-2">
                  Interactive Features
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block border-b border-white/5 pb-1">Primary Deck View:</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => setPresentationActive(true)}
                      className={`text-left p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        presentationActive 
                          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' 
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <span>Show Presentation Materials</span>
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </button>

                    <button
                      onClick={() => setPresentationActive(false)}
                      className={`text-left p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        !presentationActive 
                          ? 'bg-amber-600/10 text-amber-400 border border-amber-500/30' 
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <span>Show Video Participant Grid</span>
                      <Users className="w-4 h-4 text-[#8ab4f8]" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2.5">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block border-b border-white/5 pb-1">Whiteboard Lesson Specs:</span>
                  <span className="text-[10px] text-zinc-400 leading-relaxed block">
                    Use the Live Board tab in the middle presentation view to write or showcase formulas, equations or coordinate mapping.
                  </span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Google Meet floating interactive console bottom bar */}
      <footer className="bg-[#202124] px-6 py-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 z-30">
        
        {/* Left indicators */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-black px-3 py-1.5 rounded-lg border border-white/5 flex items-center space-x-2 text-xs">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-mono text-[11px] tracking-wide text-zinc-300">
              MEET ID: {session.id.substring(0, 11).toUpperCase()}
            </span>
          </div>
          <span className="text-zinc-500">|</span>
          <div className="text-[11px] tracking-wide text-zinc-400 font-mono uppercase">
            {role === 'teacher' ? 'INSTRUCTOR ROLE' : 'STUDENT ENROLLED'}
          </div>
        </div>

        {/* Center control buttons */}
        <div className="flex items-center justify-center space-x-3.5">
          
          {/* Mute Mic controller */}
          <button
            onClick={handleMicStatus}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              micActive 
                ? 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4f54]' 
                : 'bg-red-500 border-transparent text-white hover:bg-red-600'
            }`}
            title={micActive ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera On Off Controller to activate physical stream */}
          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              videoActive 
                ? 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4f54]' 
                : 'bg-red-500 border-transparent text-white hover:bg-red-600'
            }`}
            title={videoActive ? 'Stop Camera' : 'Start Camera'}
          >
            {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Toggle Simulated closed captions speech to text */}
          <button
            onClick={() => setCaptionsActive(!captionsActive)}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              captionsActive 
                ? 'bg-[#8ab4f8]/20 border-transparent text-[#8ab4f8] hover:bg-[#8ab4f8]/30' 
                : 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4f54]'
            }`}
            title="Toggle Live Subtitles (CC)"
          >
            <Captions className="w-5 h-5" />
          </button>

          {/* Student Audio Broadcast Listener */}
          {role === 'student' && (
            <button
              onClick={() => {
                if (!isAudioListening) {
                  setIsAudioListening(true);
                  speakTeacher(`Connected to ${session.teacherName}'s live audio stream. Tuning in now.`);
                } else {
                  setIsAudioListening(false);
                  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                }
              }}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isAudioListening 
                  ? 'bg-emerald-500/20 border-transparent text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-red-500/20 border-transparent text-red-500 hover:bg-red-500/30'
              }`}
              title={isAudioListening ? "Mute Teacher's Audio Broadcast" : "Listen to Teacher's Live Stream"}
            >
              {isAudioListening ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </button>
          )}

          {/* Raise/Lower Hand */}
          <button
            onClick={handleRaiseHand}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              handRaised 
                ? 'bg-amber-500/20 border-transparent text-amber-400 hover:bg-amber-500/30' 
                : 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4f54]'
            }`}
            title="Raise / Lower Hand to Speak"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Presentation Switcher link */}
          <button
            onClick={handleTogglePresent}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              presentationActive 
                ? 'bg-[#8ab4f8]/20 border-transparent text-[#8ab4f8] hover:bg-[#8ab4f8]/30' 
                : 'bg-[#3c4043] border-transparent text-white hover:bg-[#4a4f54]'
            }`}
            title="Toggle Presentation / Roster View"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Red circular leave meeting disconnect block */}
          <button
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white p-3 rounded-full transition-all duration-150 shadow-lg cursor-pointer flex items-center justify-center border-none"
            title="Disconnect & Hang Up"
            id="leave-meet-direct"
          >
            <X className="w-5 h-5 rotate-45 stroke-[3px]" />
          </button>

        </div>

        {/* Right action control drawer icons */}
        <div className="flex items-center space-x-3 text-zinc-400">
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`p-2.5 rounded-lg transition hover:bg-white/5 cursor-pointer ${
              showDrawer ? 'text-indigo-400 bg-white/5' : 'text-zinc-400'
            }`}
            title="Toggle Collapsible Side Drawer"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowDrawer(true);
              setDrawerTab('chat');
            }}
            className="p-2.5 rounded-lg transition hover:bg-white/5 cursor-pointer"
            title="Open Instant Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            className="p-2.5 rounded-lg transition hover:bg-white/5 cursor-not-allowed"
            disabled
            title="Meeting settings"
          >
            <Settings className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

      </footer>

    </div>
  );
}
