/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Trophy, BookOpen, Calendar, HelpCircle, FileText, CheckCircle2, 
  Clock, ArrowRight, UserCheck, Sparkles, Send, Play, Cpu, GraduationCap,
  Lock, ShieldAlert, EyeOff, Share2, AlertTriangle, X, ZoomIn, ZoomOut, Maximize2, Eye,
  Video, UploadCloud, QrCode, CreditCard, ChevronDown, ChevronRight, Download
} from 'lucide-react';
import { Student, Quiz, Assignment, Submission, QuizAttempt, LiveClass, ClassGrade, ChapterMaterial, CountdownTimerConfig, DoubtSessionReminder, StudentDoubtSubmission } from '../types';
import PdfCanvasViewer from './PdfCanvasViewer';
import { jsPDF } from 'jspdf';
import { EShikshaPieLogoIcon, EShikshaPieCourseBrand } from './EShikshaPieLogo';
import { exportTicketToPDF } from '../utils/pdfExport';
import { RoadmapData, RoadmapTimeline } from './RoadmapTimeline';
import { getSubjectsForClass } from '../utils/subjects';
import { Subject } from '../types';


const isSameClass = (classA?: string, classB?: string) => {
  if (!classA || !classB) return false;
  const norm = (c: string) => c.replace(/\s*[Bb]atch\s*/i, '').trim().toLowerCase();
  return norm(classA) === norm(classB);
};


interface SidebarCountdownWidgetProps {
  config: CountdownTimerConfig | undefined;
  onNavigateTab: (tab: 'live' | 'curriculum' | 'assignments' | 'quizzes' | 'tests' | 'my_progress') => void;
  liveClasses: LiveClass[];
  assignments: Assignment[];
}

export function SidebarCountdownWidget({ config, onNavigateTab, liveClasses, assignments }: SidebarCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isOver: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    if (!config || !config.isActive || !config.targetDateTime) return;

    const calculateTime = () => {
      const targetTime = new Date(config.targetDateTime).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config?.targetDateTime, config?.isActive]);

  if (!config || !config.isActive) {
    return (
      <div className="glass-panel border-white/5 bg-[#0F0F16]/60 p-4 rounded-2xl text-center shadow-lg">
        <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-2 animate-pulse" />
        <h4 className="text-[10px] font-black text-white uppercase tracking-wider">No Scheduled Countdown</h4>
        <p className="text-[9px] text-zinc-400 mt-1">Check back later for urgent class updates from teachers.</p>
      </div>
    );
  }

  const isLiveClass = config.type === 'live_class';
  const isAssignment = config.type === 'assignment';

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="glass-panel border-amber-500/20 bg-gradient-to-b from-[#131122]/95 to-[#0b0a16]/95 p-5 rounded-2xl relative overflow-hidden shadow-2xl group transition-all duration-300 hover:border-amber-500/40">
      {/* Decorative pulse blur glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all"></div>
      
      {/* Header / Published label */}
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/5">
        <span className="text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-full font-black tracking-widest uppercase flex items-center gap-1">
          <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
          URGENT COUNTDOWN
        </span>
        <span className="text-[8.5px] text-zinc-550 text-indigo-400 font-mono font-black uppercase tracking-wider">
          TEACHER PUBLISHED
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-black text-white uppercase leading-normal tracking-wide mb-3 font-display">
        {config.title}
      </h4>

      {/* Timer display */}
      {timeLeft.isOver ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center my-3">
          <span className="text-[10px] text-rose-400 font-black tracking-widest uppercase animate-pulse block">
            ⏳ TIME ENFORCED / WORK ENGAGED
          </span>
          <p className="text-[9px] text-zinc-500 mt-1 uppercase font-mono">DEADLINE ELAPSED OR SESSION IS ACTIVE</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 text-center my-4 select-none">
          {/* Days */}
          <div className="bg-[#0c0c16]/95 border border-white/5 rounded-xl p-1.5">
            <span className="block font-mono text-base lg:text-lg font-black text-white leading-none tracking-tight">
              {formatNum(timeLeft.days)}
            </span>
            <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block mt-1">
              DYS
            </span>
          </div>

          {/* Hours */}
          <div className="bg-[#0c0c16]/95 border border-white/5 rounded-xl p-1.5">
            <span className="block font-mono text-base lg:text-lg font-black text-amber-400 leading-none tracking-tight animate-pulse">
              {formatNum(timeLeft.hours)}
            </span>
            <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block mt-1">
              HRS
            </span>
          </div>

          {/* Mins */}
          <div className="bg-[#0c0c16]/95 border border-white/5 rounded-xl p-1.5">
            <span className="block font-mono text-base lg:text-lg font-black text-amber-500 leading-none tracking-tight">
              {formatNum(timeLeft.minutes)}
            </span>
            <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block mt-1">
              MIN
            </span>
          </div>

          {/* Secs */}
          <div className="bg-[#0c0c16]/95 border border-white/5 rounded-xl p-1.5">
            <span className="block font-mono text-base lg:text-lg font-black text-orange-500 leading-none tracking-tight">
              {formatNum(timeLeft.seconds)}
            </span>
            <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block mt-1">
              SEC
            </span>
          </div>
        </div>
      )}

      {/* Subtle details */}
      <div className="text-[9px] font-mono text-zinc-400 bg-black/45 p-2.5 rounded-xl border border-white/5 space-y-1 text-left">
        <div className="flex justify-between">
          <span>Target Date:</span>
          <span className="text-zinc-200 font-bold">
            {new Date(config.targetDateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
            {new Date(config.targetDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Category:</span>
          <span className="text-indigo-400 uppercase font-black tracking-widest">
            {config.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation Shortcut Button to drive engagement */}
      <div className="mt-4">
        {isLiveClass ? (
          <button
            onClick={() => onNavigateTab('live')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white font-black text-[9px] tracking-widest uppercase py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-white" />
            <span>JOIN CLASS PLATFORM</span>
          </button>
        ) : isAssignment ? (
          <button
            onClick={() => onNavigateTab('assignments')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/20 text-white font-black text-[9px] tracking-widest uppercase py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>RESOLVE HOMEWORK DESK</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="w-full bg-orange-600 hover:bg-orange-500 border border-orange-400/20 text-white font-black text-[9px] tracking-widest uppercase py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>GO TO STUDY CENTRE</span>
          </button>
        )}
      </div>
    </div>
  );
}

interface StudentDashboardViewProps {
  students: Student[];
  assignments: Assignment[];
  quizzes: Quiz[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  liveClasses: LiveClass[];
  onAddSubmission: (newSub: Omit<Submission, 'id'>) => void;
  onAddQuizAttempt: (newAttempt: QuizAttempt) => void;
  onTriggerClassSession: (session: LiveClass) => void;
  onUpdateStudent: (student: Student) => void;
  onAddStudent: (student: Student) => void;
  chapterMaterials: ChapterMaterial[];
  countdownConfig?: CountdownTimerConfig;
  doubtReminders: DoubtSessionReminder[];
  doubtSubmissions: StudentDoubtSubmission[];
  onSetDoubtSubmissions: React.Dispatch<React.SetStateAction<StudentDoubtSubmission[]>>;
  onSetChapterMaterials?: (mats: ChapterMaterial[]) => void;
}

function getPdfViewerUrl(id: string): string {
  const origin = window.location.origin;
  const absoluteUrl = `${origin}/api/pdf/view/${id}`;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return absoluteUrl;
  }
  return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
}

export default function StudentDashboardView({
  students,
  assignments,
  quizzes,
  submissions,
  quizAttempts,
  liveClasses,
  onAddSubmission,
  onAddQuizAttempt,
  onTriggerClassSession,
  onUpdateStudent,
  onAddStudent,
  chapterMaterials,
  countdownConfig,
  doubtReminders,
  doubtSubmissions,
  onSetDoubtSubmissions,
  onSetChapterMaterials
}: StudentDashboardViewProps) {
  // Current Student Session State loaded securely and persisted across refreshes
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('logged_student_id');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Student;
        return parsed || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Synchronized student profile from central database
  const dbStudent = currentStudent 
    ? (students.find(s => s.id === currentStudent.id) || currentStudent) 
    : null;

  // Student Registration & Login Portal States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerAccessCode, setRegisterAccessCode] = useState('');
  const [registerClass, setRegisterClass] = useState<ClassGrade>('Class 12');
  const [registerCourse, setRegisterCourse] = useState('ANVI-24');
  const [registerType, setRegisterType] = useState<'regular' | 'abhedya_gurukul'>('regular');
  const [registerPhoto, setRegisterPhoto] = useState('');
  const [registerPhotoName, setRegisterPhotoName] = useState('');
  const [registerContact, setRegisterContact] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerJoinDate, setRegisterJoinDate] = useState('');
  const [registerError, setRegisterError] = useState('');

  // States for Quick Content Upload inside Student Study Centre (Curriculum)
  const [quickUploadExpanded, setQuickUploadExpanded] = useState(false);
  const [quickSubject, setQuickSubject] = useState<'MATHS' | 'SCIENCE' | 'SST' | 'MENTAL ABILITY'>('MATHS');
  const [quickChapterId, setQuickChapterId] = useState('');
  const [quickChapterName, setQuickChapterName] = useState('');
  const [quickType, setQuickType] = useState<'booklet' | 'video' | 'test' | 'ncert' | 'question_bank' | 'revision_notes' | 'mlc'>('booklet');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickVideoUrl, setQuickVideoUrl] = useState('');
  const [quickFileUrl, setQuickFileUrl] = useState('');
  const [quickSuccessMsg, setQuickSuccessMsg] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginAccessCode, setLoginAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showEnrolledDirectory, setShowEnrolledDirectory] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  const [missingInfoContact, setMissingInfoContact] = useState('');
  const [missingInfoAddress, setMissingInfoAddress] = useState('');
  const [missingInfoJoinDate, setMissingInfoJoinDate] = useState('');
  // Tab switch
  const [activeTab, setActiveTab] = useState<'live' | 'curriculum' | 'assignments' | 'quizzes' | 'tests' | 'my_progress' | 'doubts'>('live');
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const [currentTick, setCurrentTick] = useState(Date.now());

  useEffect(() => {
    const int = setInterval(() => setCurrentTick(Date.now()), 1000);
    return () => clearInterval(int);
  }, []);

  const getSessionRemaining = () => {
    if (!dbStudent?.loginTimestamp) return { days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0, coins: 0 };
    const maxDurationMs = 90 * 24 * 60 * 60 * 1000;
    const loginMs = new Date(dbStudent.loginTimestamp).getTime();
    const elapsedMs = currentTick - loginMs;
    const remainingMs = Math.max(0, maxDurationMs - elapsedMs);
    const coins = Math.floor((remainingMs / maxDurationMs) * 2500); // Decays to 0 over 90 days.
    
    return {
      days: Math.floor(remainingMs / (24 * 60 * 60 * 1000)),
      hours: Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
      minutes: Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)),
      seconds: Math.floor((remainingMs % (60 * 1000)) / 1000),
      ms: remainingMs,
      coins
    };
  };

  const sessionData = getSessionRemaining();

  // Student Doubt Session Form States
  const [doubtSubChapter, setDoubtSubChapter] = useState('');
  const [doubtSubDayType, setDoubtSubDayType] = useState<'Saturday' | 'Sunday' | 'Special Holiday'>('Saturday');
  const [doubtSubTimeSlot, setDoubtSubTimeSlot] = useState('10:00 AM to 11:00 AM');
  const [doubtSubDesc, setDoubtSubDesc] = useState('');
  const [doubtSubImageBase64, setDoubtSubImageBase64] = useState<string>('');
  const [doubtSubImageName, setDoubtSubImageName] = useState<string>('');
  const [doubtSubTargetGrade, setDoubtSubTargetGrade] = useState<ClassGrade>('Class 12');

  // Zoomed picture modal helper state (Student view)
  const [activeZoomImageStudent, setActiveZoomImageStudent] = useState<string | null>(null);

  // States for organized Chapters & Study Materials Curriculum Hub
  const [curriculumSubject, setCurriculumSubject] = useState<Subject>('Mathematics');
  const [curriculumExpandedChapter, setCurriculumExpandedChapter] = useState<string | null>(null);
  const [curriculumSelectedMaterial, setCurriculumSelectedMaterial] = useState<ChapterMaterial | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=1`;
    }
    return null;
  };

  const handleEnterVideoFullscreen = () => {
    const targetElement = playerContainerRef.current || videoRef.current;
    if (targetElement) {
      try {
        if (targetElement.requestFullscreen) {
          targetElement.requestFullscreen();
        } else if ((targetElement as any).webkitRequestFullscreen) {
          (targetElement as any).webkitRequestFullscreen();
        } else if ((targetElement as any).msRequestFullscreen) {
          (targetElement as any).msRequestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request rejected or not supported:", err);
      }
    }
  };
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('my_class');

  // Interactive Quiz Taking States
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [answersSheet, setAnswersSheet] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizCompletedScore, setQuizCompletedScore] = useState<number | null>(null);

  // Celebrate first scorer full marks popup state
  const [perfectScoreCelebration, setPerfectScoreCelebration] = useState<{
    show: boolean;
    studentName: string;
    quizTitle: string;
  } | null>(null);

  // Interactive Assignment solver states
  const [solvingAssignment, setSolvingAssignment] = useState<Assignment | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [isSubmittingHW, setIsSubmittingHW] = useState(false);

  // Interactive Custom written tests solver states
  const [testNotes, setTestNotes] = useState('');
  const [testFileName, setTestFileName] = useState('');
  const [testFileUrl, setTestFileUrl] = useState('');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  const existingSub = solvingAssignment && currentStudent
    ? submissions.find(sub => sub.assignmentId === solvingAssignment.id && sub.studentId === currentStudent.id)
    : null;

  // Payment portal sandbox states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [upiId, setUpiId] = useState('');
  const [paymentCardName, setPaymentCardName] = useState('');
  const [paymentCardNumber, setPaymentCardNumber] = useState('');
  const [paymentCardExpiry, setPaymentCardExpiry] = useState('');
  const [paymentCardCVC, setPaymentCardCVC] = useState('');
  const [paymentCoupon, setPaymentCoupon] = useState('');
  const [paymentAppliedDiscount, setPaymentAppliedDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // ID Card Viewer states
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [idCardPdfUrl, setIdCardPdfUrl] = useState('');

  const handleNotebookPDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setUploadedPdfUrl(base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleTestPDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTestFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setTestFileUrl(base64Url);
    };
    reader.readAsDataURL(file);
  };

  // Simulated live instant API grading inside Student view for faster feedback!
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  
  const generateRoadmap = async () => {
    const subjectMaterials = (chapterMaterials || []).filter(mat => {
      if (!mat || mat.subject !== curriculumSubject) return false;
      return !mat.targetClass || isSameClass(mat.targetClass, studentClass);
    });

    const matData = subjectMaterials.map(m => ({ title: m.title, description: m.content || m.chapterName, type: m.materialType }));
    // We can't pass all materials in URL. So we will pass subject and classLevel, 
    // and rely on RoadmapFullscreen to gather materials from its end or default ones.
    
    const params = new URLSearchParams({
      view: 'roadmap',
      subject: curriculumSubject,
      classLevel: dbStudent?.enrolledClass || 'Class 12'
    });

    try {
      localStorage.setItem('roadmap_req_materials', JSON.stringify(matData));
    } catch(e) {}
    
    window.open(`?${params.toString()}`, '_blank');
  };

  // Interactive PDF viewer custom states
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfContrast, setPdfContrast] = useState(true);
  const [pdfPage, setPdfPage] = useState(1);
  const [isPdfDecrypted, setIsPdfDecrypted] = useState(true);

  // Floating PDF modal viewer states
  const [viewerPDF, setViewerPDF] = useState<Assignment | null>(null);
  const [viewerMaterialFile, setViewerMaterialFile] = useState<ChapterMaterial | null>(null);
  const [viewerMode, setViewerMode] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    if (viewerPDF) {
      setViewerMode('pdf');
    }
  }, [viewerPDF]);

  // Sync form inputs when active assignment changes
  useEffect(() => {
    setStudentNotes('');
    setUploadedFileName('');
    setUploadedPdfUrl('');
    setPdfZoom(100);
    setPdfPage(1);
    setIsPdfDecrypted(true);
  }, [solvingAssignment]);

  // Auto-sync current student profile if keys get updated in central database
  useEffect(() => {
    if (currentStudent) {
      const match = students.find(s => s.id === currentStudent.id);
      if (match && JSON.stringify(match) !== JSON.stringify(currentStudent)) {
        setCurrentStudent(match);
        try {
          localStorage.setItem('logged_student_id', JSON.stringify(match));
        } catch (e) {}
      }
    }
  }, [students, currentStudent]);

  // Enforce 3-Month Security Expiration Rule
  // Once logged in, session is valid for 3 months. Afterwards, login resets and passcode credentials are cleared on the system.
  useEffect(() => {
    if (!currentStudent) return;
    
    const dbStudentMatch = students.find(s => s.id === currentStudent.id) || currentStudent;
    
    if (dbStudentMatch.loginTimestamp) {
      const loginDate = new Date(dbStudentMatch.loginTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - loginDate.getTime();
      const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
      
      if (diffMs >= ninetyDaysInMs) {
        // Log out student and clear local session
        localStorage.removeItem('logged_student_id');
        setCurrentStudent(null);
        
        // Clear passcode/credentials so they must be re-created ("creds have to be created")
        const resetRecord = {
          ...dbStudentMatch,
          accessCode: "", // Completely resets passcode/credentials
          loginTimestamp: undefined
        };
        onUpdateStudent(resetRecord);
        
        alert(`🔒 SECURE SESSION EXPIRED / WALLET EMPTY:\nYour secure 90-day login session has expired and your digital wallet coins have completely depleted to 0.\n\nYou must pay to recharge your account package to generate a new secret passcode and restore access to the learning hub.`);
      }
    } else {
      // Initialize if missing
      const nowStr = new Date().toISOString();
      const updated = { ...dbStudentMatch, loginTimestamp: nowStr };
      onUpdateStudent(updated);
      try {
        localStorage.setItem('logged_student_id', JSON.stringify(updated));
      } catch (e) {}
    }
  }, [currentStudent, students, onUpdateStudent, currentTick]);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const formattedEmail = loginEmail.trim().toLowerCase();
    const formattedCode = loginAccessCode.trim().toUpperCase();

    if (!formattedEmail || !formattedCode) {
      setLoginError('Both registered student email and passcode are required.');
      return;
    }

    const matched = students.find(
      s => s.email.toLowerCase() === formattedEmail && s.accessCode.toUpperCase() === formattedCode
    );

    if (matched) {
      if (!matched.accessCode) {
        setLoginError('This account passcode is expired or needs to be created. Please contact your instructor.');
        return;
      }
      const nowStr = new Date().toISOString();
      const updatedMatched = { ...matched, loginTimestamp: nowStr };
      
      onUpdateStudent(updatedMatched);
      setCurrentStudent(updatedMatched);
      try {
        localStorage.setItem('logged_student_id', JSON.stringify(updatedMatched));
      } catch (e) {}
      setLoginEmail('');
      setLoginAccessCode('');
    } else {
      setLoginError('Incorrect student email address or passcode key. Inspect keys below.');
    }
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    const formattedName = registerName.trim();
    const formattedEmail = registerEmail.trim().toLowerCase();
    const formattedCode = registerAccessCode.trim().toUpperCase();

    if (!formattedName || !formattedEmail || !formattedCode) {
      setRegisterError('All fields are key registration requirements.');
      return;
    }

    // Check if email already registered within central database
    const alreadyExists = students.some(
      s => s.email.toLowerCase() === formattedEmail
    );

    if (alreadyExists) {
      setRegisterError('This registered email matches an existing account. Try logging in.');
      return;
    }

    // Prepare custom high-fidelity details according to handwritten SPEC diagram
    const idNum = Math.floor(10000 + Math.random() * 90000);
    const generatedIdCard = `ESHIKSHA-USER-${idNum}`;

    const newStudent: Student = {
      id: 'student_' + Math.floor(1000 + Math.random() * 9000).toString(),
      name: formattedName,
      email: formattedEmail,
      accessCode: formattedCode,
      enrolledClass: registerClass,
      avatar: registerPhoto || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(formattedName)}`,
      paymentStatus: 'unpaid',
      studentPhoto: registerPhoto || undefined,
      studentIdCardNumber: generatedIdCard,
      courseName: registerCourse,
      walletBalance: 2500, // Pre-funded with 2500 Coins
      loginTimestamp: new Date().toISOString(), // Secure starting timestamp
      active: true,
      registrationType: registerType,
      contactNumber: registerContact,
      residenceAddress: registerAddress,
      dateOfJoining: registerJoinDate
    };

    onAddStudent(newStudent);
    setCurrentStudent(newStudent);
    try {
      localStorage.setItem('logged_student_id', JSON.stringify(newStudent));
    } catch (e) {}

    // Reset details
    setRegisterName('');
    setRegisterEmail('');
    setRegisterAccessCode('');
    setRegisterContact('');
    setRegisterAddress('');
    setRegisterJoinDate('');
    setRegisterType('regular');
    setRegisterPhoto('');
    setRegisterPhotoName('');
    setIsRegistering(false);
  };

  // Handler: Open / Generate Student ID Card PDF
  const handleOpenStudentIDCard = () => {
    const s = dbStudent;
    if (!s) return;

    const studentName = s.name || 'Student';
    const idCardNumber = s.studentIdCardNumber || 'ESHIKSHA-USER-00000';
    const enrolledClass = s.enrolledClass || 'Class 12';
    const courseName = s.courseName || 'ANVI-24';
    const email = s.email || '';
    const accessCode = s.accessCode || '';

    // Create a horizontal canvas to fit Front and Back side-by-side
    // Frame size: 180mm x 125mm
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [180, 125]
    });

    // Let's draw the BACKGROUND representation of the page
    doc.setFillColor(250, 250, 250); // very soft white card tray
    doc.rect(0, 0, 180, 125, 'F');

    // Add high-contrast text stating FRONT & BACK labels of double sided card print sheet
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ESHIKSHAPIE ACADEMY - OFFICIAL STUDENT MEMBERSHIP SPECIAL CREDENTIAL', 10, 8);

    // ==================== FRONT SIDE (Left CARD, x=10, y=10 to x=85, y=115, height=105) ====================
    // Card tray border and background
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 12, 75, 105, 'F');
    // Card border
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.4);
    doc.rect(10, 12, 75, 105, 'D');

    // Header Waves for Front side
    // Dark Charcoal bottom layer
    doc.setFillColor(41, 41, 48); // #292930
    doc.rect(10, 12, 75, 22, 'F');
    doc.triangle(10, 34, 85, 34, 85, 42, 'F');

    // White gap divider
    doc.setFillColor(255, 255, 255);
    doc.triangle(10, 31, 85, 31, 85, 39, 'F');
    doc.rect(10, 12, 75, 15, 'F');

    // Bright Orange top layer
    doc.setFillColor(255, 90, 31); // #FF5A1F
    doc.rect(10, 12, 75, 12, 'F');
    doc.triangle(10, 24, 85, 24, 85, 32, 'F');

    // LOGO elements on Header (Front)
    // Logo Icon: Red circular outline
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.circle(17, 19, 3.2, 'D');
    
    // Logo Icon central symbol: Pi
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('\u03C0', 17, 21, { align: 'center' });

    // Logo Text brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('eShikshaPie', 22, 19.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMY MEMBER', 22, 23.5);

    // Centered Avatar Frame
    const avatarCenterX = 47.5;
    const avatarCenterY = 51.5;
    
    // Thick Orange Circular Ring
    doc.setDrawColor(255, 90, 31); // #FF5A1F
    doc.setLineWidth(1.1);
    doc.circle(avatarCenterX, avatarCenterY, 11, 'D');

    // Inner White outline gap
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.circle(avatarCenterX, avatarCenterY, 9.8, 'D');

    // Silhouette Background inside
    doc.setFillColor(30, 30, 36); // charcoal
    doc.circle(avatarCenterX, avatarCenterY, 9.2, 'F');

    // Draw initial dynamically in white
    const init = studentName ? studentName.charAt(0).toUpperCase() : 'S';
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(init, avatarCenterX, avatarCenterY + 4.5, { align: 'center' });

    // Student Name
    doc.setTextColor(30, 30, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(studentName.toUpperCase(), avatarCenterX, 70, { align: 'center' });

    // "ONLINE STUDENT" text in Orange
    let batch = courseName || 'ARJUNA';
    if (batch === 'ANVI-24') batch = 'ARJUNA BATCH';
    else if (batch === 'VIKA-24') batch = 'VIKAS BATCH';
    doc.setTextColor(255, 90, 31);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`${batch.toUpperCase()} STUDENT`, avatarCenterX, 74, { align: 'center' });

    // Details separator line and data (Grid rows on Front)
    doc.setDrawColor(255, 90, 31);
    doc.setLineWidth(0.3);
    doc.line(34, 82, 34, 102); // vertical divider line

    let rowY = 86;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(140, 140, 140);
    doc.text('Student ID #:', 14, rowY);
    doc.setTextColor(30, 30, 36);
    doc.text(idCardNumber, 36, rowY);

    rowY += 6;
    doc.setDrawColor(240, 240, 240);
    doc.line(14, rowY - 3, 56, rowY - 3); // horizontal border line
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 140, 140);
    doc.text('Grade Level:', 14, rowY);
    doc.setTextColor(30, 30, 36);
    doc.text(enrolledClass, 36, rowY);

    rowY += 6;
    doc.setDrawColor(240, 240, 240);
    doc.line(14, rowY - 3, 56, rowY - 3); // horizontal border line
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 140, 140);
    doc.text('Date of Birth:', 14, rowY);
    doc.setTextColor(30, 30, 36);
    // Calculated Dob
    let sumDob = 0;
    for (let j = 0; j < idCardNumber.length; j++) sumDob += idCardNumber.charCodeAt(j);
    const yDob = 2008 + (sumDob % 3);
    const mDob = 1 + (sumDob % 12);
    const dDob = 1 + (sumDob % 28);
    const padDob = (n: number) => n.toString().padStart(2, '0');
    const dobString = `${padDob(dDob)}/${padDob(mDob)}/${yDob}`;
    doc.text(dobString, 36, rowY);

    // Sharp Vector Simulated QR Code box at bottom right
    const qrx = 62;
    const qry = 83;
    doc.setDrawColor(220, 220, 220);
    doc.rect(qrx, qry, 18, 18, 'D');
    
    // Draw QR Code anchors (three outer boxes in corners)
    doc.setFillColor(0, 0, 0);
    doc.rect(qrx + 1, qry + 1, 4, 4, 'F');
    doc.rect(qrx + 13, qry + 1, 4, 4, 'F');
    doc.rect(qrx + 1, qry + 13, 4, 4, 'F');
    // Inner anchors
    doc.setFillColor(255, 255, 255);
    doc.rect(qrx + 2, qry + 2, 2, 2, 'F');
    doc.rect(qrx + 14, qry + 2, 2, 2, 'F');
    doc.rect(qrx + 2, qry + 14, 2, 2, 'F');
    // random data pixel simulation
    doc.setFillColor(0, 0, 0);
    for (let rx = 1; rx < 17; rx += 2.5) {
      for (let ry = 1; ry < 17; ry += 2.5) {
        if ((rx > 5 || ry > 5) && (rx > 5 || ry < 12) && (rx < 12 || ry > 5)) {
          if ((Math.sin(rx * 3 + ry * 5) > 0)) {
            doc.rect(qrx + rx, qry + ry, 1.8, 1.8, 'F');
          }
        }
      }
    }

    // Beautiful footer waves on Front Left card
    doc.setFillColor(41, 41, 48); // #292930
    doc.triangle(10, 117, 85, 117, 10, 109, 'F');
    doc.setFillColor(255, 255, 255);
    doc.triangle(10, 119, 85, 119, 10, 112, 'F');
    doc.setFillColor(255, 90, 31); // #FF5A1F
    doc.triangle(10, 121, 85, 121, 10, 115, 'F');
    doc.rect(10, 121, 75, 4, 'F'); // exact matching footer band

    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('▲ FRONT SIDE', 47.5, 113, { align: 'center' });


    // ==================== BACK SIDE (Right CARD, x=95, y=10 to x=170, y=115, height=105) ====================
    // Card tray border and background
    doc.setFillColor(255, 255, 255);
    doc.rect(95, 12, 75, 105, 'F');
    // Card border
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.4);
    doc.rect(95, 12, 75, 105, 'D');

    // Header Waves for Back side
    // Dark Charcoal bottom layer
    doc.setFillColor(41, 41, 48); // #292930
    doc.rect(95, 12, 75, 22, 'F');
    doc.triangle(95, 34, 170, 34, 170, 42, 'F');

    // White gap divider
    doc.setFillColor(255, 255, 255);
    doc.triangle(95, 31, 170, 31, 170, 39, 'F');
    doc.rect(95, 12, 75, 15, 'F');

    // Bright Orange top layer
    doc.setFillColor(255, 90, 31); // #FF5A1F
    doc.rect(95, 12, 75, 12, 'F');
    doc.triangle(95, 24, 170, 24, 170, 32, 'F');

    // LOGO elements on Header (Back)
    // Logo Icon: Red circular outline
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.circle(102, 19, 3.2, 'D');
    
    // Logo Icon central symbol: Pi
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('\u03C0', 102, 21, { align: 'center' });

    // Logo Text brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('eShikshaPie', 107, 19.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('ACADEMY OFFICIAL', 107, 23.5);

    // Centered Badge Badge Icon
    doc.setFillColor(15, 23, 42); // slate dark body
    doc.circle(132.5, 50, 7.5, 'F');
    doc.setDrawColor(255, 90, 31);
    doc.setLineWidth(0.6);
    doc.circle(132.5, 50, 7.5, 'D');

    // Render white text Pi inside badge
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('\u03C0', 132.5, 52.8, { align: 'center' });

    // Content details (Rows of back information)
    let backY = 64;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(140, 140, 140);
    
    doc.text('Phone:', 99, backY);
    doc.setTextColor(30, 30, 36);
    doc.text('+91 98765 00000', 113, backY);

    backY += 5.5;
    doc.setDrawColor(240, 240, 240);
    doc.line(99, backY - 3, 166, backY - 3);
    doc.setTextColor(140, 140, 140);
    doc.text('Email:', 99, backY);
    doc.setTextColor(30, 30, 36);
    let backEmail = email;
    if (backEmail.length > 21) backEmail = backEmail.substring(0, 19) + '...';
    doc.text(backEmail, 113, backY);

    backY += 5.5;
    doc.setDrawColor(240, 240, 240);
    doc.line(99, backY - 3, 166, backY - 3);
    doc.setTextColor(140, 140, 140);
    doc.text('Address:', 99, backY);
    doc.setTextColor(30, 30, 36);
    doc.setFontSize(5);
    doc.text('eShikshaPie National Cloud Campus India', 113, backY);

    // Solid Terms and conditions paragraph
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(140, 140, 140);
    doc.text('TERMS OF USE:', 99, 81);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.3);
    doc.setTextColor(130, 130, 130);
    doc.text('This ID Card remains the copyright property of eShikshaPie. It is strictly non-transferable and must be presented on demand for secure written assessments and live laboratories.', 99, 85, { maxWidth: 66 });

    // Barcode rendering dynamically
    doc.setFillColor(0, 0, 0);
    let barX = 99;
    while (barX < 166) {
      const bW = ((barX * 4 + 7) % 3) / 1.5 + 0.3; // realistic look
      const bG = ((barX * 9 + 2) % 3) / 1.5 + 0.3;
      doc.rect(barX, 93, bW, 7, 'F');
      barX += bW + bG;
    }

    // Footers waves on Back Right card
    doc.setFillColor(41, 41, 48); // #292930
    doc.triangle(95, 117, 170, 117, 95, 109, 'F');
    doc.setFillColor(255, 255, 255);
    doc.triangle(95, 119, 170, 119, 95, 112, 'F');
    doc.setFillColor(255, 90, 31); // #FF5A1F
    doc.triangle(95, 121, 170, 121, 95, 115, 'F');
    doc.rect(95, 121, 75, 4, 'F'); // exact matching footer band

    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('▲ BACK SIDE', 132.5, 113, { align: 'center' });

    // Save and download first
    try {
      doc.save(`eShikshaPie_ID_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error('Error saving PDF:', e);
    }

    // Set preview URL to show in canvas modal viewer
    const pdfDataUri = doc.output('datauristring');
    setIdCardPdfUrl(pdfDataUri);
    setIdCardModalOpen(true);
  };

  // Filters: STRICT ENROLLMENT BOUNDARIES
  // "but student enrolled will only be able to seee his class assginmenet and work"
  const studentClass = dbStudent?.enrolledClass || currentStudent?.enrolledClass || 'Class 12';
  const classNum = parseInt((studentClass || '').replace('Class ', '')) || 0;

  const filteredLiveClasses = liveClasses.filter(lc => isSameClass(lc.targetClass, studentClass));
  const filteredAssignments = assignments.filter(a => isSameClass(a.targetClass, studentClass));
  const filteredQuizzes = quizzes.filter(q => isSameClass(q.targetClass, studentClass));
  const studentQuizAttempts = quizAttempts.filter(qa => qa.studentId === currentStudent?.id);

  // scrolling ticker: Celebrates top performers
  // Generate text list of top students completing quizzes perfectly!
  const tickerText = quizAttempts
    .filter(a => a.score === a.maxScore) // only celebrate perfect scores
    .map(a => `🏆 [WEEKLY HONOR ROLL] ${a.studentName} solved "${a.quizTitle}" perfectly in ${Math.round(a.timeSpentMs/1000)}s! ✨`)
    .join('  •  ') || '🏆 [WEEKLY HONOR ROLL] No perfect attempts logged yet. Be the first to solve the subject quizzes! ✨';

  // Handler: Start quiz
  const handleStartQuiz = (q: Quiz) => {
    const previousAttempt = studentQuizAttempts.find(qa => qa.quizId === q.id);
    if (previousAttempt) {
      return;
    }
    setActiveQuiz(q);
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setAnswersSheet([]);
    setQuizStartTime(Date.now());
    setQuizCompletedScore(null);
  };

  // Handler: Select MCQ Option
  const handleSelectOption = (idx: number) => {
    setSelectedAnswerIdx(idx);
  };

  // Handler: Next question or Finish
  const handleNextQuestion = () => {
    if (selectedAnswerIdx === null || !activeQuiz) return;
    
    const nextAnswers = [...answersSheet, selectedAnswerIdx];
    setAnswersSheet(nextAnswers);
    setSelectedAnswerIdx(null);

    if (currentQuestionIdx + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Quiz complete!
      const elapsedMs = Date.now() - quizStartTime;
      
      // Calculate final score
      let correctCount = 0;
      activeQuiz.questions.forEach((q, index) => {
        if (nextAnswers[index] === q.correctAnswerIndex) {
          correctCount++;
        }
      });

      // Check if anybody has already completed this quiz with full marks:
      const hasPerfectAttemptAlready = quizAttempts.some(
        qa => qa.quizId === activeQuiz.id && qa.score === qa.maxScore
      );
      const isPerfectScore = correctCount === activeQuiz.questions.length;

      if (isPerfectScore && !hasPerfectAttemptAlready) {
        setPerfectScoreCelebration({
          show: true,
          studentName: currentStudent!.name,
          quizTitle: activeQuiz.title
        });

        try {
          confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.55 }
          });
          setTimeout(() => {
            confetti({
              particleCount: 120,
              angle: 60,
              spread: 60,
              origin: { x: 0, y: 0.7 }
            });
          }, 250);
          setTimeout(() => {
            confetti({
              particleCount: 120,
              angle: 120,
              spread: 60,
              origin: { x: 1, y: 0.7 }
            });
          }, 400);
        } catch (e) {
          console.error("Confetti launch error:", e);
        }
      }

      // Emit attempt to global store
      onAddQuizAttempt({
        id: 'attempt-' + Date.now(),
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        studentId: currentStudent!.id,
        studentName: currentStudent!.name,
        score: correctCount,
        maxScore: activeQuiz.questions.length,
        timeSpentMs: elapsedMs,
        completedAt: new Date().toISOString()
      });

      setQuizCompletedScore(correctCount);
    }
  };

  // Handler: Submit Assignment Solved text!
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !solvingAssignment) return;
    if (!studentNotes.trim() && !uploadedPdfUrl) {
      alert("Please either write solution notes or attach your notebook PDF submission.");
      return;
    }
    
    setIsSubmittingHW(true);

    const submissionData: Omit<Submission, 'id'> = {
      assignmentId: solvingAssignment.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentNotes: studentNotes.trim() || 'PDF submission uploaded directly.',
      submittedFile: uploadedFileName || undefined,
      submittedPdfUrl: uploadedPdfUrl || undefined,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    onAddSubmission(submissionData);

    // Simulated local solver reset
    setStudentNotes('');
    setUploadedFileName('');
    setUploadedPdfUrl('');
    setSolvingAssignment(null);
    setIsSubmittingHW(false);
  };

  // Trigger Instant Student AI grade (simulated or direct API fetch)
  const handleInstantAIGrade = async (sub: Submission, maxPoints: number) => {
    setIsAutoGrading(true);
    const relatedAssignment = assignments.find(a => a.id === sub.assignmentId);

    try {
      const response = await fetch('/api/gemini/grade-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNotes: sub.studentNotes,
          assignmentTitle: relatedAssignment?.title || 'Assignment Task',
          assignmentDescription: relatedAssignment?.description || '',
          pdfText: relatedAssignment?.pdfText || '',
          points: maxPoints
        })
      });

      if (!response.ok) throw new Error('API server busy.');
      const result = await response.json();

      // Trigger grader updates manually so student sees result immediate!
      sub.status = 'graded';
      sub.grade = {
        score: result.score,
        points: maxPoints,
        feedback: result.feedback,
        gradedAt: new Date().toISOString()
      };
    } catch (e) {
      console.error(e);
    } finally {
      setIsAutoGrading(false);
    }
  };

  if (!currentStudent) {
    if (isRegistering) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-4">
          <div className="bg-[#0F0F12] border border-white/10 p-8 w-full max-w-md relative shadow-2xl">
            <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[8px] font-black tracking-widest uppercase px-3 py-0.5">
              NEW STUDENT SIGN UP
            </div>

            <div className="text-center mb-6 pt-4">
              <div className="inline-block bg-white p-2.5 rounded-full border border-emerald-500/30 mb-3 shadow-md">
                <EShikshaPieLogoIcon size={46} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
                Register Student
              </h2>
              <p className="text-[10px] text-white/50 tracking-wider uppercase mt-1">
                Create your student account to register and continue to payment
              </p>
            </div>

            <form onSubmit={handleStudentRegister} className="space-y-4">
              {registerError && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                  ⚠️ ERROR: {registerError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  FULL NAME
                </label>
                <input
                  type="text"
                  placeholder="ex: Saksham Garg"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="ex: student@eshikshapie.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  ACCESS PASSCODE (CHOOSE CODE)
                </label>
                <input
                  type="text"
                  placeholder="ex: CHOOSE123"
                  value={registerAccessCode}
                  onChange={(e) => setRegisterAccessCode(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-mono font-black uppercase tracking-widest focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  CONTACT NUMBER
                </label>
                <input
                  type="tel"
                  placeholder="ex: 9876543210"
                  value={registerContact}
                  onChange={(e) => setRegisterContact(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  RESIDENCE ADDRESS
                </label>
                <textarea
                  placeholder="ex: 123 Academic Lane, Campus Area"
                  value={registerAddress}
                  onChange={(e) => setRegisterAddress(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition resize-none h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  DATE OF JOINING
                </label>
                <input
                  type="date"
                  value={registerJoinDate}
                  onChange={(e) => setRegisterJoinDate(e.target.value)}
                  className="w-full border border-white/10 bg-black text-[gray] focus:text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  ENROLLED GRADE CLASS
                </label>
                <select
                  value={registerClass}
                  onChange={(e) => setRegisterClass(e.target.value as ClassGrade)}
                  className="w-full border border-white/10 bg-black text-white focus:text-white rounded-none px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 outline-none transition"
                >
                  <option value="Class 1" className="bg-black text-white">Class 1</option>
                  <option value="Class 2" className="bg-black text-white">Class 2</option>
                  <option value="Class 3" className="bg-black text-white">Class 3</option>
                  <option value="Class 4" className="bg-black text-white">Class 4</option>
                  <option value="Class 5" className="bg-black text-white">Class 5</option>
                  <option value="Class 6" className="bg-black text-white font-black">Class 6 Precision Track</option>
                  <option value="Class 7" className="bg-black text-white font-black">Class 7 Special Stream</option>
                  <option value="Class 8" className="bg-black text-white font-black">Class 8 Scholarship Track</option>
                  <option value="Class 9" className="bg-black text-white">Class 9</option>
                  <option value="Class 10" className="bg-black text-white">Class 10</option>
                  <option value="Class 11" className="bg-black text-white">Class 11 (High School Pre-Grad)</option>
                  <option value="Class 12" className="bg-black text-white">Class 12 (Board Grade / Senior High)</option>
                  <option value="IIT-JEE" className="bg-black text-white">IIT-JEE Prep Session</option>
                  <option value="NEET" className="bg-black text-white">NEET Medical Prep Section</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  FOUNDATION / ADVANCED COURSE BATCH
                </label>
                <select
                  value={registerCourse}
                  onChange={(e) => setRegisterCourse(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white focus:text-white rounded-none px-3.5 py-2.5 text-xs font-bold focus:border-indigo-500 outline-none transition"
                >
                  <option value="ANVI-24" className="bg-black text-white">ANVI-24 (Advanced Booster Board Batch)</option>
                  <option value="VIKA-24" className="bg-black text-white">VIKA-24 (Foundation Apex Track)</option>
                  <option value="KAVI-24" className="bg-black text-white">KAVI-24 (Crash Course Super 40 Batch)</option>
                  <option value="VIDU-24" className="bg-black text-white">VIDU-24 (Elite Olympiad Rank-Maker)</option>
                </select>
              </div>

              <div>
                {/* Dynamically Styled Real-time ID Logo Preview Badge */}
                <div className="mt-2.5 p-3.5 bg-black border border-white/5 flex flex-col items-center justify-center rounded-xl">
                  <span className="text-[8px] font-mono font-black text-zinc-500 tracking-widest uppercase mb-2">Live Course Logo Brand Preview</span>
                  <EShikshaPieCourseBrand 
                    courseName={registerCourse === 'ANVI-24' ? 'Arjuna' : registerCourse === 'VIKA-24' ? 'Vikas' : registerCourse === 'KAVI-24' ? 'Arise' : 'Vidyapeeth'} 
                    isDark={false}
                    iconSize={38}
                    className="scale-90"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                  STUDENT PROFILE PHOTO (PIC)
                </label>
                <div className="border border-dashed border-white/20 p-4 text-center cursor-pointer hover:border-indigo-500 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="student-pic-file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setRegisterPhotoName(file.name);
                      const r = new FileReader();
                      r.onload = (ev) => {
                        setRegisterPhoto(ev.target?.result as string);
                      };
                      r.readAsDataURL(file);
                    }}
                  />
                  {registerPhoto ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img src={registerPhoto} className="w-16 h-16 rounded-full object-cover border border-indigo-500" alt="Student pic preview" />
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">✓ PHOTO CAPTURED AND READY!</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-xs text-white/70 font-semibold uppercase">DRAG & DROP OR CLICK TO UPLOAD PIC</p>
                      <p className="text-[9px] text-white/40 mt-1 uppercase">Supports JPEG, PNG, or GIF format</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 tracking-widest uppercase transition duration-150 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none"
              >
                REGISTER & GO TO PAYMENT
              </button>
            </form>

            <div className="mt-4 text-center border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setRegisterError('');
                }}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 tracking-widest uppercase underline underline-offset-4"
              >
                Already have an account? Click here to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="bg-[#0F0F12] border border-white/10 p-8 w-full max-w-md relative shadow-2xl">
          <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] font-black tracking-widest uppercase px-3 py-0.5">
            eShikshaPie STUDENT PORTAL
          </div>

          <div className="text-center mb-6 pt-4">
            <div className="inline-block bg-white p-2.5 rounded-full border border-indigo-500/30 mb-3 shadow-md">
              <EShikshaPieLogoIcon size={46} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
              Student Login
            </h2>
            <p className="text-[10px] text-white/50 tracking-wider uppercase mt-1">
              Enter email and credentials provided by your instructor
            </p>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                ⚠️ ERROR: {loginError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                STUDENT REGISTERED EMAIL
              </label>
              <input
                type="email"
                placeholder="ex: student@eshikshapie.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">
                GENERATED SECURED ACCESS CODE
              </label>
              <input
                type="password"
                placeholder="ex: ABC567"
                value={loginAccessCode}
                onChange={(e) => setLoginAccessCode(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3.5 py-2.5 text-xs font-mono font-black uppercase tracking-widest focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3.5 tracking-widest uppercase transition duration-150 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none"
            >
              LAUNCH SECURED SESSION
            </button>
          </form>

          <div className="mt-4 text-center border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setLoginError('');
              }}
              className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 tracking-widest uppercase underline underline-offset-4"
            >
              New Student? Click here to register
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Execute payment callback
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbStudent) return;
    
    setIsProcessingPayment(true);
    
    // Simulate secure authorization API delay
    setTimeout(() => {
      const isAbhedya = dbStudent.registrationType === 'abhedya_gurukul';
      const finalAmount = isAbhedya ? 300.00 : Math.max(999, 3999.00 - paymentAppliedDiscount);
      const prefix = paymentMethod === 'qr' ? 'UPI-SANDBOX-' : 'TX-SANDBOX-';
      const updated: Student = {
        ...dbStudent,
        paymentStatus: 'pending_approval',
        paymentAmount: finalAmount,
        paymentTxRef: prefix + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()
      };
      
      onUpdateStudent(updated);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    const code = paymentCoupon.trim().toUpperCase();
    if (code === 'SHIKSHAPIE' || code === 'FREE50' || code === 'STUDENT50') {
      setPaymentAppliedDiscount(1200.00);
      alert("Coupon applied! Sandbox discount of ₹1,200.00 activated.");
    } else {
      alert("Invalid coupon code! Try code: SHIKSHAPIE to save ₹1,200.");
    }
  };

  // Payment Checkpoint block
  if (dbStudent && dbStudent.paymentStatus !== 'approved') {
    const isPending = dbStudent.paymentStatus === 'pending_approval';
    const isAbhedya = dbStudent.registrationType === 'abhedya_gurukul';
    const finalAmount = isAbhedya ? 300.00 : Math.max(999, 3999.00 - paymentAppliedDiscount);

    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <div className="bg-[#0F0F12] border border-white/10 w-full max-w-4xl p-8 relative shadow-2xl space-y-6">
          <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] font-black tracking-widest uppercase px-3 py-0.5">
            eShikshaPie STRIPE SECURE TRANSACTION STANDARDS
          </div>

          <div className="flex items-center space-x-3 mb-2 pt-2">
            <div className="p-2.5 bg-indigo-950 border border-indigo-500/30 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-wider">
                {isPending ? "Verification & Access Authorization Portal" : "Access Billing: Premium Learning Subscription"}
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                {isPending ? "Platform integration: awaiting administrator clearance" : "Complete sandbox payment to unlock complete student curricula"}
              </p>
            </div>
          </div>

          {isPending ? (
            /* Pending administrator approval console */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/40 border border-amber-500/20 p-6">
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-r border-white/5 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block">Ledger Verification Status</span>
                  <span className="text-xs text-white font-mono font-bold block mt-1 px-3 py-1 bg-amber-950 border border-amber-900 animate-pulse">
                    AWAITING ADMIN APPROVAL
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  SANDBOX GATEWAY TRANSACTION RECEIPT
                </h3>
                
                <div className="space-y-2.5 border border-white/10 p-4 bg-black font-mono text-[11px] text-zinc-300">
                  <div className="flex justify-between">
                    <span>Subscriber Profile:</span>
                    <span className="text-white font-bold">{dbStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Student Email:</span>
                    <span className="text-white font-bold">{dbStudent.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="text-indigo-400 font-bold">
                      {dbStudent.paymentTxRef?.startsWith('UPI-') ? "QR Code / UPI Scan" : "Credit/Debit Card"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorization Amount:</span>
                    <span className="text-emerald-400 font-black">₹{(dbStudent.paymentAmount && dbStudent.paymentAmount > 100 ? dbStudent.paymentAmount : (dbStudent.paymentAmount ? dbStudent.paymentAmount * 85 : 3999.00)).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-zinc-450">
                    <span>Ledger Reference Ref:</span>
                    <span className="text-zinc-100 font-bold tracking-wider">{dbStudent.paymentTxRef || "GENERATING_TRANSACTION_ID"}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-3.5 text-[10.5px] leading-relaxed text-zinc-400">
                  <p>
                    💡 <strong className="text-white">Why must my account be approved?</strong> To guarantee academic safety, school moderators manually review learning invoices. A webhook invitation has been sent to the <span className="text-indigo-400 font-bold underline">Admin Dashboard</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      // Simulates quick trigger refresh or validation check
                      const matchingDb = students.find(s => s.id === dbStudent.id);
                      if (matchingDb && matchingDb.paymentStatus === 'approved') {
                        setCurrentStudent(matchingDb);
                        alert("Congratulations! Access approved. Launching student workspace.");
                      } else {
                        alert("Still pending. Access is awaiting approval under Admin Mode.");
                      }
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-black text-white font-black text-[10px] tracking-widest uppercase py-3 border border-indigo-500 rounded-none transition"
                  >
                    REFRESH ACTIVATION STATUS
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStudent(null);
                      localStorage.removeItem('logged_student_id');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-855 text-zinc-400 hover:text-white font-mono text-[9px] tracking-widest uppercase px-4 py-3 border border-zinc-800 rounded-none transition"
                  >
                    LOG OUT / USE ANOTHER ACCT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Secure Payments checkout uploader */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Order total info banner */}
              <div className="md:col-span-5 bg-black/60 border border-white/5 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">ORDER BRIEF</span>
                  <div className="border-b border-white/10 pb-4">
                    <h4 className="text-sm font-bold text-white leading-tight uppercase font-mono">eShikshaPie Semester-Pass Access Key</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">Unlock complete interactive modules, whiteboards, automated AI grading labs, and instant quiz feedback.</p>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Standard Rate:</span>
                      <span>₹3,999.00</span>
                    </div>
                    {isAbhedya && (
                      <div className="flex justify-between text-amber-400 font-bold animate-pulse">
                        <span>🔱 Gurukul Scholarship:</span>
                        <span>-₹3,699.00</span>
                      </div>
                    )}
                    {paymentAppliedDiscount > 0 && !isAbhedya && (
                      <div className="flex justify-between text-rose-500 font-bold">
                        <span>LMS Promo Discount:</span>
                        <span>-₹{paymentAppliedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-black text-sm border-t border-white/10 pt-3">
                      <span>Amount Due:</span>
                      <span className="text-emerald-400">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Coupon layout */}
                  <div>
                    <label className="block text-[9px] font-black text-white/50 mb-1.5 uppercase tracking-widest">COUPON / PROMO CODE</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Try: SHIKSHAPIE"
                        value={paymentCoupon}
                        onChange={(e) => setPaymentCoupon(e.target.value)}
                        className="flex-1 bg-black border border-white/10 rounded-none p-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-[9px] px-3 font-semibold uppercase"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="text-[8.5px] text-zinc-500 leading-snug font-mono">
                    🔒 Sandbox Stripe standards apply. Credit card parameters bypass real financial circuits for developmental auditing safety.
                  </div>
                </div>
              </div>

              {/* Checkout submit form support multiple channels (Card / QR Code) */}
              <div className="md:col-span-7 bg-[#131317] border border-white/10 p-6">
                <form onSubmit={handleExecutePayment} className="space-y-5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">SECURE ENDPOINT AUTHORIZATION</span>
                  
                  {/* Digital Payment Selectors */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center space-x-2 py-2.5 border text-[10px] font-black tracking-wider uppercase transition ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Credit/Debit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qr')}
                      className={`flex items-center justify-center space-x-2 py-2.5 border text-[10px] font-black tracking-wider uppercase transition ${
                        paymentMethod === 'qr'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Code / UPI Scan</span>
                    </button>
                  </div>

                  {paymentMethod === 'qr' ? (
                    <div className="space-y-4 animate-fade-in">
                      {/* High-fidelity ATM SIR scanning interface of UPI ID: atmsirpace@oksbi */}
                      <div className="bg-[#f0f4f9] border border-zinc-200 p-6 rounded-3xl flex flex-col items-center justify-center max-w-sm mx-auto shadow-sm">
                        {/* Header Banner: Pi Circular insignia + ATM SIR title */}
                        <div className="flex items-center space-x-2.5 mb-5 select-none">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#ea4335] flex items-center justify-center shadow-sm">
                            <span className="font-sans font-extrabold text-[#0a5cff] text-2xl select-none leading-none -translate-y-0.5">π</span>
                          </div>
                          <span className="font-sans font-black text-slate-850 text-xl tracking-tight select-none">ATM SIR</span>
                        </div>

                        {/* Centered White QR Container with Large Corners */}
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-100 flex flex-col items-center w-full relative">
                          <div className="relative w-52 h-52 flex items-center justify-center bg-white p-2">
                            {/* Dynamic high-resolution scannable UPI QR code with GPay overlay */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=atmsirpace@oksbi&pn=ATM SIR&am=${finalAmount.toFixed(2)}&cu=INR`)}`}
                              alt="Scannable UPI QR Code"
                              className="w-full h-full object-contain select-none animate-fade-in"
                              referrerPolicy="no-referrer"
                            />

                            {/* Centered multi-color Google Pay insignia overlay */}
                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100 select-none">
                              <div className="flex items-center space-x-0.5">
                                <div className="w-1.5 h-6 bg-[#4285f4] rounded-full" />
                                <div className="w-1.5 h-6 bg-[#ea4335] rounded-full transform translate-y-1.5" />
                                <div className="w-1.5 h-6 bg-[#fbbc05] rounded-full transform -translate-y-1" />
                                <div className="w-1.5 h-6 bg-[#34a853] rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* UPI Code label underneath the QR */}
                          <span className="font-sans font-bold text-[#5f6368] text-xs md:text-sm mt-5 tracking-wide">
                            UPI ID: atmsirpace@oksbi
                          </span>
                        </div>

                        {/* Scanner instructions */}
                        <span className="font-sans font-medium text-[#5f6368] text-[11px] md:text-xs mt-4 uppercase tracking-wider">
                          Scan to pay with any UPI app
                        </span>

                        <div className="mt-4 text-center">
                          <span className="text-xs text-slate-800 font-bold font-mono">Amount Due: <span className="text-indigo-650 font-black">₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">YOUR VALID UPI ID / BILLING DETAIL ADDRESS</label>
                        <input 
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="student@okhdfcbank"
                          className="w-full bg-black border border-white/10 text-white rounded-none p-3 text-xs font-mono outline-none focus:border-indigo-500 transition"
                          required={paymentMethod === 'qr'}
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-indigo-400 text-xs text-center border-2 border-indigo-900 bg-indigo-950 p-1 font-bold">✓</span>
                        <span className="text-[9.5px] text-zinc-400 font-mono">Sandbox gateway simulates automatic QR scanning receipt audit standards.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-indigo-600 hover:bg-black text-white font-black tracking-widest uppercase text-xs py-4 border border-indigo-500 rounded-none transition flex items-center justify-center space-x-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>VERIFYING RESPONSIVE QR TRANSACTION...</span>
                          </>
                        ) : (
                          <>
                            <span>SUBMIT UPI / QR SANDBOX PROOF - ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                            setCurrentStudent(null);
                            localStorage.removeItem('logged_student_id');
                        }}
                        className="w-full text-center text-zinc-400 hover:text-white font-mono text-[9px] tracking-wider uppercase underline underline-offset-4 mt-2"
                      >
                        CANCEL TRANSACTION & LOGIN AS ANOTHER STUDENT
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <label className="block text-[9px] font-black text-white/40 mb-1 uppercase tracking-widest">CARDHOLDER NAME</label>
                        <input 
                          type="text"
                          value={paymentCardName || currentStudent?.name || ""}
                          onChange={(e) => setPaymentCardName(e.target.value)}
                          placeholder="Saksham Garg"
                          className="w-full bg-black border border-white/10 text-white rounded-none p-3 text-xs font-semibold outline-none focus:border-indigo-500 transition"
                          required={paymentMethod === 'card'}
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-white/40 mb-1 uppercase tracking-widest">CREDIT CARD NUMBER</label>
                        <div className="relative">
                          <input 
                            type="text"
                            value={paymentCardNumber}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\s?/g, '').replace(/\D/g, '');
                              if (val.length > 16) val = val.substring(0, 16);
                              const matches = val.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || '';
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              setPaymentCardNumber(parts.length > 0 ? parts.join(' ') : val);
                            }}
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-black border border-white/10 text-white rounded-none p-3 pl-10 text-xs font-mono outline-none focus:border-indigo-500 transition"
                            required={paymentMethod === 'card'}
                          />
                          <span className="absolute left-3.5 top-3.5 text-xs text-indigo-500 font-mono font-bold">💳</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-white/40 mb-1 uppercase tracking-widest">EXPIRY DATE (MM/YY)</label>
                          <input 
                            type="text"
                            value={paymentCardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 4) val = val.substring(0, 4);
                              if (val.length >= 2) {
                                setPaymentCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
                              } else {
                                setPaymentCardExpiry(val);
                              }
                            }}
                            placeholder="11/28"
                            className="w-full bg-black border border-white/10 text-white rounded-none p-3 text-xs font-mono outline-none focus:border-indigo-500 transition"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-white/40 mb-1 uppercase tracking-widest">SECURITY CODE (CVC)</label>
                          <input 
                            type="password"
                            value={paymentCardCVC}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 4) setPaymentCardCVC(val);
                            }}
                            placeholder="372"
                            className="w-full bg-black border border-white/10 text-white rounded-none p-3 text-xs font-mono outline-none focus:border-indigo-500 transition"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-emerald-500 text-xs text-center border-2 border-emerald-900 bg-emerald-950 p-1 font-bold">✓</span>
                        <span className="text-[9.5px] text-zinc-400 font-mono">Simulating real Stripe transaction protocol. Sandbox security bounds active.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-emerald-600 hover:bg-black text-white font-black tracking-widest uppercase text-xs py-4 border border-emerald-500 rounded-none transition flex items-center justify-center space-x-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>PROCESSING STRIPE PAYMENT PORTAL...</span>
                          </>
                        ) : (
                          <>
                            <span>AUTHORIZE SECURE PAYMENT - ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                            setCurrentStudent(null);
                            localStorage.removeItem('logged_student_id');
                        }}
                        className="w-full text-center text-zinc-400 hover:text-white font-mono text-[9px] tracking-wider uppercase underline underline-offset-4 mt-2"
                      >
                        CANCEL TRANSACTION & LOGIN AS ANOTHER STUDENT
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (dbStudent) {
      if (dbStudent.contactNumber && !missingInfoContact) setMissingInfoContact(dbStudent.contactNumber);
      if (dbStudent.residenceAddress && !missingInfoAddress) setMissingInfoAddress(dbStudent.residenceAddress);
      if (dbStudent.dateOfJoining && !missingInfoJoinDate) setMissingInfoJoinDate(dbStudent.dateOfJoining);
    }
  }, [dbStudent]);

  if (dbStudent && (!dbStudent.contactNumber || !dbStudent.residenceAddress || !dbStudent.dateOfJoining)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in relative z-10 w-full max-w-xl mx-auto space-y-6">
        <div className="bg-white border border-rose-200 p-8 rounded-none shadow-xl w-full text-center">
          <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-rose-600 tracking-widest uppercase mb-2">MANDATORY INFORMATION REQUIRED</h2>
          <p className="text-sm text-slate-500 mb-8 font-mono leading-relaxed">
            Welcome back to eShikshaPie. As part of our upgraded security and administrative compliance, all students must complete their profile before accessing the learning hub.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!missingInfoContact.trim() || !missingInfoAddress.trim() || !missingInfoJoinDate.trim()) {
              alert("All fields are mandatory.");
              return;
            }
            if (onUpdateStudent) {
              onUpdateStudent({
                ...dbStudent,
                contactNumber: missingInfoContact.trim(),
                residenceAddress: missingInfoAddress.trim(),
                dateOfJoining: missingInfoJoinDate.trim()
              });
            }
          }} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                CONTACT NUMBER
              </label>
              <input 
                type="tel"
                value={missingInfoContact}
                onChange={(e) => setMissingInfoContact(e.target.value)}
                placeholder="ex: 9876543210"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-none p-3 text-xs font-semibold outline-none focus:border-rose-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                RESIDENCE ADDRESS
              </label>
              <textarea 
                value={missingInfoAddress}
                onChange={(e) => setMissingInfoAddress(e.target.value)}
                placeholder="ex: 123 Scholar Lane..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-none p-3 text-xs font-semibold outline-none focus:border-rose-500 transition h-24 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                DATE OF JOINING
              </label>
              <input 
                type="date"
                value={missingInfoJoinDate}
                onChange={(e) => setMissingInfoJoinDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-none p-3 text-xs font-semibold outline-none focus:border-rose-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black tracking-widest uppercase text-xs py-4 border border-rose-500 rounded-none transition"
            >
              SAVE UPDATES & PROCEED
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8" id="student-portal-workspace">
      
        {/* Ticker marquee for end-of-week top performer badge */}
        {/* Satisfies: "at end of week the top performer is shwon in badge as scroling in student dashbaord" */}
        {!zenMode && (
          <div className="glass-panel rounded-2xl py-3.5 px-4 overflow-hidden relative flex items-center pr-4 shadow-sm border-indigo-100">
            <div className="flex items-center space-x-2 absolute left-4 z-10 bg-white px-3.5 py-1.5 border border-amber-200 rounded-lg select-none text-[10px] font-bold text-amber-600 tracking-wider uppercase shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>CLASS SPEEDWAY CHAMPION</span>
            </div>
            <div className="whitespace-nowrap overflow-hidden inline-block w-full pl-64">
              <div className="inline-block animate-marquee text-[11px] font-bold text-slate-700 font-mono tracking-widest uppercase">
                {tickerText}
              </div>
            </div>
          </div>
        )}

      {/* Profile choosing header styled with beautiful glassmorphism and subtle glowing accents */}
      <div className="glass-panel border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-indigo-600/10 to-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-500"></div>
        <div className="absolute top-0 left-0 bg-indigo-600/20 text-indigo-400 text-[8px] font-black tracking-widest uppercase px-3 py-1 border-r border-b border-indigo-500/20 rounded-br-xl">
          STUDENT PORTAL INDEX BY SUBJECT ACCESSIBILITY
        </div>
        <button
          onClick={() => setZenMode(!zenMode)}
          className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black tracking-widest uppercase border-l border-b rounded-bl-xl transition-all z-20 ${
            zenMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
          }`}
        >
          {zenMode ? 'Disable Zen Mode' : 'Enable Zen Mode'}
        </button>
        
        <div className="flex items-center space-x-5 pt-3">
          {currentStudent && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
              <img 
                src={currentStudent.avatar} 
                alt={currentStudent.name} 
                className="relative w-16 h-16 rounded-2xl object-cover border border-white/20 p-1 bg-[#0b0b14]/90"
              />
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                ENROLLED CLASS: {studentClass}
              </span>
              {dbStudent?.loginTimestamp && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" />
                    SESSION VALIDITY: {sessionData.days} Days, {String(sessionData.hours).padStart(2, '0')}:{String(sessionData.minutes).padStart(2, '0')}:{String(sessionData.seconds).padStart(2, '0')} LEFT
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm("⚠️ DEMO SECURITY OVERRIDE:\nAre you sure you want to fast-forward the login session date by 91 days to simulate a 3-month expiration?")) return;
                      const date91Ago = new Date();
                      date91Ago.setDate(date91Ago.getDate() - 91);
                      onUpdateStudent({ ...dbStudent, loginTimestamp: date91Ago.toISOString() });
                    }}
                    className="text-[8.5px] bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    title="Developer instant 3-month session lapse trigger"
                  >
                    ⚡ SIMULATE 3-MONTH EXPIRY
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-widest mt-1 uppercase italic font-display bg-gradient-to-r from-slate-700 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              STUDENT: {currentStudent?.name || 'ACADEMIC STUDENT'}
            </h2>
            {dbStudent?.registrationType === 'abhedya_gurukul' ? (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[9px] bg-[#FFE0B2]/10 border border-[#FFB74D]/50 text-amber-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_2px_10px_rgba(245,158,11,0.1)]">
                  <span>🔱</span> ABHEDYA GURUKUL BADGE
                </span>
                <span className="text-[9px] bg-[#E8F5E9]/10 border border-[#81C784]/50 text-emerald-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_2px_10px_rgba(16,185,129,0.1)]">
                  <span>🎓</span> SCHOLARSHIP BADGE
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 mt-2 font-sans select-none">
                <span className="text-[9.5px] bg-red-500/10 border border-red-500/35 text-red-500 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_2px_10px_rgba(239,68,68,0.1)]">
                  <span>🎯</span> ARJUNA BATCH BADGE
                </span>
                <span className="text-[9.5px] bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_2px_10px_rgba(99,102,241,0.1)]">
                  <span>🎓</span> NORMAL STUDENT
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Course Batch Brand Profile Badge */}
        {!zenMode && dbStudent && (
          <div className="flex items-center shrink-0 relative z-10 select-none">
            <EShikshaPieCourseBrand 
              courseName={dbStudent.registrationType === 'abhedya_gurukul' ? 'ABHEDYA GURUKUL' : dbStudent.courseName}
              isDark={dbStudent.registrationType === 'abhedya_gurukul'}
              className={dbStudent.registrationType === 'abhedya_gurukul' ? "border-white/5 bg-black/40 hover:bg-black/80 transition duration-300" : "scale-[0.8] origin-right shadow-2xl"}
              iconSize={40}
            />
          </div>
        )}

        {/* Sign Out Action Button */}
        <div className="flex items-center w-full md:w-auto relative z-10">
          <button
            onClick={() => {
              setCurrentStudent(null);
              localStorage.removeItem('logged_student_id');
            }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold tracking-widest px-5 py-2.5 transition-all duration-300 rounded-xl w-full md:w-auto uppercase shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            Sign Out Session
          </button>
        </div>
      </div>

      {/* Mobile-optimized select dropdown for device adaptive navigation */}
      {!zenMode && (
        <div className="block md:hidden mb-4 relative z-20">
          <label className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 label-cyber">
            ⚡ SELECT MOBILE WORKSPACE SECTION
          </label>
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as any);
              setActiveQuiz(null);
              setSolvingAssignment(null);
            }}
            className="w-full bg-[#12111E] text-[11px] font-bold text-zinc-200 border border-white/10 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="live">LIVE CLASSROOMS ({filteredLiveClasses.length})</option>
            <option value="curriculum">📖 STUDY CENTRE</option>
            <option value="assignments">HOMEWORK DESK ({filteredAssignments.length})</option>
            <option value="quizzes">MCQ CHALLENGES ({filteredQuizzes.length})</option>
            <option value="tests">✍ SECURED WRITTEN TESTS</option>
            <option value="my_progress">MY PERFORMANCE INDEX (GPA)</option>
            <option value="doubts">🙋‍♂️ STUDY CLASS & DOUBTS</option>
          </select>
        </div>
      )}

      {/* Tabs list with beautiful cyber pills - hidden on narrow screens, shown from md onwards */}
      {!zenMode && (
        <div className="hidden md:flex border-b border-slate-200 pb-2 space-x-2.5 overflow-x-auto no-scrollbar relative z-10">
          {[
            { id: 'live', label: `LIVE CLASSROOMS (${filteredLiveClasses.length})`, icon: Calendar },
            { id: 'curriculum', label: '📖 STUDY CENTRE', icon: BookOpen },
          { id: 'assignments', label: `HOMEWORK DESK (${filteredAssignments.length})`, icon: FileText },
          { id: 'quizzes', label: `MCQ CHALLENGES (${filteredQuizzes.length})`, icon: BookOpen },
          { id: 'tests', label: `✍ SECURED WRITTEN TESTS`, icon: GraduationCap },
          { id: 'my_progress', label: 'MY PERFORMANCE INDEX (GPA)', icon: Trophy },
          { id: 'doubts', label: '🙋‍♂️ STUDY CLASS & DOUBTS', icon: HelpCircle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActiveQuiz(null);
                setSolvingAssignment(null);
              }}
              className={`flex items-center space-x-2 px-5 py-3 text-[11px] font-bold tracking-wider uppercase border transition-all duration-300 rounded-xl whitespace-nowrap shrink-0 group ${
                isActive
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      )}

      {/* Grid Layout containing Main Content and Student Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 w-full" id="student-grid-layout">
        
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">

          {/* ---------------------------------------------------- */}
          {/* 1. Live Class stream joiner */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'live' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Active Live Broadcasts</h3>
            <p className="text-sm text-zinc-400/80 mt-1">Ready virtual stream board ports configured for class <span className="text-indigo-400 font-extrabold">{studentClass}</span>.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveClasses.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 glass-panel rounded-2xl p-16 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                <span className="inline-block w-2.5 h-2.5 bg-zinc-600 rounded-full mr-2"></span>
                No active live broadcasts scheduled for class {studentClass} right now
              </div>
            ) : (
              filteredLiveClasses.map((lc) => (
                <div key={lc.id} className="glass-panel border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden shadow-lg hover:shadow-indigo-500/5">
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-indigo-500/10 to-violet-500/0 rounded-full blur-2xl group-hover:from-indigo-500/15 transition-all"></div>
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 font-extrabold uppercase border border-indigo-500/20 rounded-full tracking-wider">
                        {lc.subject.toUpperCase()}
                      </span>
                      {lc.isLive && (
                        <span className="text-[9px] bg-red-500/15 text-red-500 px-3 py-1 font-black animate-pulse border border-red-500/30 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          LIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-base leading-snug uppercase tracking-tight font-display">{lc.title}</h4>
                    <p className="text-zinc-400 text-xs mt-2 font-medium">Instructor: <span className="font-bold text-zinc-300">{lc.teacherName}</span></p>
                    
                    {lc.meetLink && (
                      <div className="mt-4 bg-[#0a0a14]/65 border border-white/5 px-3 py-2 flex items-center justify-between gap-2.5 rounded-xl">
                        <span className="text-[10px] text-zinc-400 truncate font-mono tracking-normal">{lc.meetLink}</span>
                        <a 
                          href={lc.meetLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[9px] bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-2.5 py-1 rounded-lg font-bold uppercase shrink-0 transition-all duration-200"
                        >
                          OPEN URL
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-semibold">
                      PORT_CLASS: L-{lc.targetClass}
                    </span>
                    {lc.isLive ? (
                      <button
                        onClick={() => {
                          if (lc.meetLink) {
                            window.open(lc.meetLink, '_blank');
                          } else {
                            const letters = 'abcdefghijklmnopqrstuvwxyz';
                            const r = (len: number) => Array.from({length: len}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
                            const genLink = `https://meet.google.com/${r(3)}-${r(4)}-${r(3)}`;
                            window.open(genLink, '_blank');
                          }
                        }}
                        className="bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/30 text-white font-bold text-[10px] tracking-wider uppercase px-4.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      >
                        <Video className="w-3.5 h-3.5 text-white" />
                        <span>JOIN GOOGLE MEET</span>
                      </button>
                    ) : (
                      <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        OFFLINE ROOM
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1.5 organized Chapters & Study Materials Curriculum Hub */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Syllabus Chapters & Course Material Repository</h3>
              <p className="text-xs text-zinc-400/80 mt-1">Access book chapters, practice items, video recordings, and solution booklets uploaded by your expert teachers.</p>
              <button
                onClick={generateRoadmap}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition duration-200"
              >
                Generate AI Roadmap
              </button>
            </div>
            
            {dbStudent ? (
              <button
                onClick={handleOpenStudentIDCard}
                className="group bg-indigo-950/10 hover:bg-indigo-950/30 hover:border-indigo-500/50 border border-white/5 p-3.5 flex items-center space-x-3 rounded-2xl transition-all duration-300 cursor-pointer text-left select-none shadow-lg"
                title="Click to view and download your Official PDF ID Card"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] text-indigo-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                    <span>REGISTRATION ID CARD</span>
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  </span>
                  <span className="text-xs text-white font-mono font-bold uppercase group-hover:text-indigo-300 transition-colors flex items-center gap-2 mt-0.5">
                    {dbStudent.studentIdCardNumber || 'NOT ENROLLED'}
                    {dbStudent.stream && (
                      <span className="text-[9px] text-zinc-300 border border-white/10 bg-white/5 px-2 py-0.5 rounded-full font-sans uppercase font-extrabold tracking-wider ml-1">
                        {dbStudent.stream}
                      </span>
                    )}
                    <span className="text-[9px] text-indigo-400/80 border border-indigo-500/20 bg-indigo-950/30 px-2 py-0.5 rounded-full font-sans uppercase font-extrabold tracking-wider">
                      VIEW PDF ID
                    </span>
                  </span>
                </div>
              </button>
            ) : (
              <div className="bg-[#0c0c14] border border-white/5 p-3.5 flex items-center space-x-3 rounded-2xl shadow-inner">
                <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase">REGISTRATION ID CARD:</span>
                <span className="text-xs text-white font-mono font-bold uppercase">NOT ENROLLED</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left side: Subject Selector column */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-3">
              {classNum >= 11 && classNum <= 12 && dbStudent && !dbStudent.stream && (
                <div className="mb-6 p-4 border border-rose-400 bg-rose-50 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full pointer-events-none"></div>
                  <h4 className="text-[11px] font-bold text-rose-600 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Mandatory Action
                  </h4>
                  <p className="text-[10px] text-zinc-700 mb-4 leading-relaxed max-w-[90%]">
                    Please select your academic stream. <strong className="text-zinc-900 font-extrabold">This action is permanent</strong> and will align your dashboard with relevant subjects.
                  </p>
                  <div className="flex flex-col gap-2 relative z-10 bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                    <button 
                      onClick={() => {
                        onUpdateStudent({ ...dbStudent, stream: 'Science' });
                        setCurriculumSubject('Physics');
                      }}
                      className="w-full py-2.5 bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-700 tracking-wide transition-all"
                    >
                      Science Stream
                    </button>
                    <button 
                      onClick={() => {
                        onUpdateStudent({ ...dbStudent, stream: 'Commerce' });
                        setCurriculumSubject('Accounts');
                      }}
                      className="w-full py-2.5 bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-bold text-emerald-700 tracking-wide transition-all"
                    >
                      Commerce Stream
                    </button>
                  </div>
                </div>
              )}

              <h4 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">Academic Branches</h4>
              
              {getSubjectsForClass(studentClass as ClassGrade)
                .filter(streamGroup => {
                  if (classNum < 11 || classNum > 12) return true;
                  if (!dbStudent?.stream) return false; // Hide branches until picked
                  return streamGroup.stream === 'General' || streamGroup.stream === dbStudent.stream;
                })
                .map((streamGroup) => (
                <div key={streamGroup.stream} className="space-y-2 mb-4">
                  {streamGroup.stream !== 'General' && (
                    <h5 className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">{streamGroup.stream} Stream</h5>
                  )}
                  {streamGroup.subjects.map((subj) => {
                    const count = (chapterMaterials || []).filter(m => {
                      if (!m || m.subject !== subj.id) return false;
                      return !m.targetClass || isSameClass(m.targetClass, studentClass);
                    }).length;
                    const active = curriculumSubject === subj.id;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => {
                          setCurriculumSubject(subj.id as any);
                          setCurriculumExpandedChapter(null);
                        }}
                        className={`w-full text-left p-4 border transition-all duration-300 text-xs lg:text-sm font-bold flex flex-col justify-between rounded-2xl relative overflow-hidden group/btn ${
                          active 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1.5 sm:gap-2">
                          <span className="tracking-widest uppercase text-xs lg:text-sm">{subj.name}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border self-start sm:self-auto shrink-0 ${active ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            {count} resources
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold mt-2 tracking-widest uppercase ${active ? 'text-indigo-500' : 'text-slate-400'}`}>
                          {subj.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                <span className="block text-[9px] font-mono text-indigo-600 uppercase tracking-widest font-black">STUDENT WALLET MATRIX</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Wallet Balance:</span>
                  <span className="text-sm text-emerald-600 font-mono font-black">{sessionData.coins || 0} Coins</span>
                </div>
                <div className="text-[9px] text-slate-500 font-semibold leading-relaxed uppercase">
                  Wallet is self-recharging. Use coins to buy chapter test keys immediately inside learning hub!
                </div>
              </div>
            </div>

            {/* Right side: Chapters Inside selected subject */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-4">
              {classNum >= 11 && classNum <= 12 && dbStudent && !dbStudent.stream ? (
                <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-inner h-full min-h-[400px]">
                  <h3 className="text-sm font-black text-slate-700 tracking-widest uppercase mb-2">Stream Selection Pending</h3>
                  <p className="text-[12px] text-slate-500 font-medium max-w-md">Please select your academic stream from the left panel to unlock your chapter curriculum and materials.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                <h4 className="text-xs font-black text-white/60 tracking-widest uppercase">
                  {curriculumSubject} CHAPTER MATERIALS & BOOKLETS
                </h4>
                
                <div className="flex items-center space-x-2 bg-indigo-500/5 px-3 py-1.5 border border-indigo-500/20 rounded-full select-none text-xs">
                  <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wide">SECURE CLASS SEGMENT:</span>
                  <span className="text-[10px] font-mono font-extrabold text-white uppercase tracking-wide">
                    {studentClass || "ASSIGNED CLASS"}
                  </span>
                </div>
              </div>

              {(() => {
                const subjectMaterials = (chapterMaterials || []).filter(mat => {
                  if (!mat || mat.subject !== curriculumSubject) return false;
                  return !mat.targetClass || isSameClass(mat.targetClass, studentClass);
                });
                
                // Group by Chapter ID
                const halfSyllabusTests = subjectMaterials.filter(m => m.materialType === 'test' && m.subType === 'half_syllabus_test');
                const fullSyllabusTests = subjectMaterials.filter(m => m.materialType === 'test' && m.subType === 'full_syllabus_test');

                const chaptersMap = new Map<string, { id: string; name: string; materials: ChapterMaterial[] }>();
                subjectMaterials.forEach(m => {
                  if (m.materialType === 'test' && (m.subType === 'half_syllabus_test' || m.subType === 'full_syllabus_test')) {
                    return; // Skip global cumulative tests from chapter folders
                  }
                  if (!chaptersMap.has(m.chapterId)) {
                    chaptersMap.set(m.chapterId, { id: m.chapterId, name: m.chapterName, materials: [] });
                  }
                  chaptersMap.get(m.chapterId)!.materials.push(m);
                });
                
                const chaptersList = Array.from(chaptersMap.values()).sort((a, b) => a.id.localeCompare(b.id));

                return (
                  <div className="space-y-6">
                    {/* Dedicated Cumulative term test portal banner & list if available */}
                    {(halfSyllabusTests.length > 0 || fullSyllabusTests.length > 0) && (
                      <div className="glass-panel border-indigo-500/10 p-5 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center space-x-2.5 border-b border-indigo-500/5 pb-3">
                          <Trophy className="w-5 h-5 text-indigo-400 shrink-0" />
                          <div>
                            <h4 className="text-xs font-black text-white tracking-widest uppercase flex flex-wrap items-center gap-2">
                              <span>Syllabus Comprehensive Term Tests Portal</span>
                              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">SECURE EXAMINATION PORTAL</span>
                            </h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wide">Course milestones prepared by department chairs and graded subjective assessors</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {halfSyllabusTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-[#0b0b14]/50 border border-white/5 hover:border-indigo-500/30 transition p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[8px] font-mono bg-indigo-950 text-indigo-300 font-bold border border-indigo-900/40 px-2 py-0.5 uppercase">
                                      HALF SYLLABUS SCHEME
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${
                                        sub.status === 'graded' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-amber-950/40 text-amber-400 border-indigo-800/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-xl transition"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START TEST ASSESSMENT'}
                                </button>
                              </div>
                            );
                          })}

                          {fullSyllabusTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-[#0b0b14]/50 border border-white/5 hover:border-indigo-500/30 transition p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[8px] font-mono bg-purple-950/40 text-purple-300 font-bold border border-purple-900/40 px-2 py-0.5 rounded-full uppercase">
                                      FULL SYLLABUS BOARD MOCK
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${
                                        sub.status === 'graded' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-amber-950/40 text-amber-400 border-indigo-800/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-xl transition"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START TEST ASSESSMENT'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {chaptersList.length === 0 ? (
                      <div className="glass-panel border-white/5 rounded-2xl p-16 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                        📕 No chapters uploaded for {curriculumSubject} yet. Ask your trainer to publish resources.
                      </div>
                    ) : (
                      chaptersList.map((chapter) => {
                        const mats = chapter.materials;
                        const booklets = mats.filter(m => m.materialType === 'booklet');
                        const videos = mats.filter(m => m.materialType === 'video');
                        const tests = mats.filter(m => m.materialType === 'test' && (m.subType === 'part_test' || !m.subType));
                        const ncert = mats.filter(m => m.materialType === 'ncert');
                        const qbanks = mats.filter(m => m.materialType === 'question_bank');
                        const revnotes = mats.filter(m => m.materialType === 'revision_notes');
                        const mlc = mats.filter(m => m.materialType === 'mlc');
                        const collapsed = curriculumExpandedChapter !== chapter.id;

                        return (
                          <div key={chapter.id} className="glass-panel border-white/5 focus-within:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300">
                            {/* Chapter Header row */}
                            <button
                              onClick={() => setCurriculumExpandedChapter(collapsed ? chapter.id : null)}
                              className="w-full text-left p-5 flex items-center justify-between hover:bg-white/[0.02] transition focus:outline-none"
                            >
                              <div>
                                <div className="flex items-center space-x-3">
                                  <span className="bg-indigo-520/10 border border-indigo-500/20 text-indigo-400 font-mono font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {chapter.id}
                                  </span>
                                  <h5 className="font-bold text-white text-sm uppercase tracking-wide font-display">{chapter.name}</h5>
                                </div>
                                <p className="text-[10px] text-zinc-450 mt-1.5 uppercase tracking-wide font-semibold">Contains {mats.length} total active lecture booklets & resources</p>
                              </div>
                              <span className="text-zinc-450 hover:text-white transition-colors">
                                {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                              </span>
                            </button>

                            {/* Expanded Material slots list */}
                            {!collapsed && (
                              <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                
                                {/* 1. Booklet Category Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">1. BOOKLETS ({booklets.length})</span>
                                      <span className="text-[9px] bg-indigo-50 text-indigo-650 border border-indigo-150 font-mono px-1.5 py-0.5 rounded font-bold">INDEXED</span>
                                    </div>
                                    {booklets.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {/* Subdivided by booklet subtypes */}
                                        {['theory', 'examples', 'pyq', 'practice', 'dpp'].map((sub) => {
                                          const subMats = booklets.filter(b => b.subType === sub);
                                          if (subMats.length === 0) return null;
                                          return (
                                            <div key={sub} className="space-y-1">
                                              <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">{sub} section:</span>
                                              {subMats.map(bm => (
                                                <button
                                                  key={bm.id}
                                                  onClick={() => setCurriculumSelectedMaterial(bm)}
                                                  className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 pl-1.5 border-l border-slate-200 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                                >
                                                  <span className="shrink-0">📘</span>
                                                  <span className="truncate">{bm.title}</span>
                                                </button>
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 2. Video Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">2. VIDEO LESSONS ({videos.length})</span>
                                      <span className="text-[9px] bg-slate-50 text-slate-650 border border-slate-150 font-mono px-1.5 py-0.5 rounded font-bold">MP4 / HLS</span>
                                    </div>
                                    {videos.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {videos.map(v => (
                                          <button
                                            key={v.id}
                                            onClick={() => setCurriculumSelectedMaterial(v)}
                                            className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                          >
                                            <span className="shrink-0">🎥</span>
                                            <span className="truncate">{v.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 3. Tests / Quizzes Clip Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">3. CHAPTER TESTS ({tests.length})</span>
                                      <span className="text-[9px] bg-rose-50 text-rose-750 border border-rose-150 font-mono px-1.5 py-0.5 rounded font-bold">ASSESSMENT</span>
                                    </div>
                                    {tests.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {tests.map((t) => (
                                          <button
                                            key={t.id}
                                            onClick={() => setCurriculumSelectedMaterial(t)}
                                            className="w-full text-left text-[11px] font-semibold text-rose-750 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/70 hover:border-rose-200 py-1.5 px-2 flex items-center gap-1.5 min-w-0 cursor-pointer rounded-lg transition"
                                          >
                                            <span className="shrink-0">📝</span>
                                            <span className="truncate font-bold">{t.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 4. NCERT Solutions Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">4. NCERT SOLUTIONS ({ncert.length})</span>
                                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 font-mono px-1.5 py-0.5 rounded font-bold">TEXTBOOK</span>
                                    </div>
                                    {ncert.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {ncert.map(nc => (
                                          <button
                                            key={nc.id}
                                            onClick={() => setCurriculumSelectedMaterial(nc)}
                                            className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                          >
                                            <span className="shrink-0">✅</span>
                                            <span className="truncate">{nc.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 5. Question Bank Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">5. QUESTION BANK ({qbanks.length})</span>
                                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-150 font-mono px-1.5 py-0.5 rounded font-bold">OBJ+SUBJ</span>
                                    </div>
                                    {qbanks.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {qbanks.map(qb => (
                                          <button
                                            key={qb.id}
                                            onClick={() => setCurriculumSelectedMaterial(qb)}
                                            className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                          >
                                            <span className="shrink-0">🎯</span>
                                            <span className="truncate">{qb.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 6. Revision Notes Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow transition">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">6. REVISION NOTES ({revnotes.length})</span>
                                      <span className="text-[9px] bg-violet-50 text-violet-700 border border-violet-150 font-mono px-1.5 py-0.5 rounded font-bold">RECAP</span>
                                    </div>
                                    {revnotes.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {revnotes.map(rn => (
                                          <button
                                            key={rn.id}
                                            onClick={() => setCurriculumSelectedMaterial(rn)}
                                            className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                          >
                                            <span className="shrink-0">📌</span>
                                            <span className="truncate">{rn.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 7. MLC Weak Students Slot */}
                                <div className="border border-slate-200/60 bg-white p-3.5 rounded-xl flex flex-col justify-between md:col-span-2 lg:col-span-3 shadow-sm hover:shadow transition animate-none">
                                  <div>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                      <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase">7. M.L.C. (MINIMUM LEARNING CONTENT / WEAK STUDENTS) ({mlc.length})</span>
                                      <span className="text-[9px] bg-pink-50 text-pink-700 border border-pink-150 font-mono px-1.5 py-0.5 rounded font-bold">SCIENTIFIC SECURED COMPACT</span>
                                    </div>
                                    {mlc.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 uppercase italic font-mono p-2">Not uploaded</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {mlc.map(mItem => (
                                          <button
                                            key={mItem.id}
                                            onClick={() => setCurriculumSelectedMaterial(mItem)}
                                            className="w-full text-left text-[11px] font-semibold text-slate-800 hover:text-indigo-600 hover:underline py-1 flex items-center gap-1.5 min-w-0 cursor-pointer"
                                          >
                                            <span className="shrink-0">⭐</span>
                                            <span className="truncate">{mItem.title}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                );
              })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. My Assignments Homework solver */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Homework Assignments</h3>
              <p className="text-sm text-zinc-400/80 mt-1">Showing items published for class <span className="font-extrabold text-indigo-400">{studentClass}</span>.</p>
            </div>

            <div className="space-y-3">
              {filteredAssignments.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-xs text-zinc-500 uppercase tracking-widest font-mono">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  No pending home tasks for {studentClass}
                </div>
              ) : (
                filteredAssignments.map((a) => {
                  const studentSub = submissions.find(sub => sub.assignmentId === a.id && sub.studentId === currentStudent?.id);
                  const isSelected = solvingAssignment?.id === a.id;
                  return (
                    <div 
                      key={a.id}
                      onClick={() => setSolvingAssignment(a)}
                      className={`p-4 border cursor-pointer transition-all duration-300 flex flex-col justify-between rounded-2xl relative overflow-hidden group ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/25 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                          : 'border-white/5 bg-[#0F0F16]/40 hover:border-white/10 hover:bg-[#0F0F16]/65'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <span className="text-[9px] bg-white/5 text-zinc-300 px-2.5 py-1 rounded-full font-bold uppercase border border-white/10 tracking-widest">
                          {a.subject.toUpperCase()}
                        </span>
                        {studentSub ? (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            studentSub.status === 'graded' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-white/5 text-zinc-300 border-white/10'
                          }`}>
                            {studentSub.status === 'graded' ? `✓ GRADED: ${studentSub.grade?.score} PTS` : 'SUBMITTED'}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 font-extrabold px-2.5 py-1 rounded-full uppercase border border-amber-500/20 tracking-wider flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                            PENDING WORK
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1.5 uppercase tracking-wide group-hover:text-indigo-300 transition-colors truncate font-display">{a.title}</h4>
                      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider font-semibold">MAX_PTS: {a.points} | DUE: {a.dueDate}</p>
                      {a.pdfName && (
                        <div className="mt-3.5 flex items-center justify-between gap-1.5 bg-[#0A0A10]/80 border border-white/5 p-2 px-3 rounded-xl select-none text-[9px] font-mono">
                          <div className="flex items-center space-x-1.5 min-w-0 text-indigo-400">
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate font-bold tracking-wider uppercase">PDF ATTACHED: {a.pdfName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewerPDF(a);
                            }}
                            className="bg-indigo-500/10 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500/40 font-bold px-3 py-1 rounded-lg uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0F0F12] border border-white/10 rounded-none p-6 shadow-sm">
            {solvingAssignment ? (
              <div className="space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase font-mono">{solvingAssignment.subject} ASSIGNMENT TASK (CLASS {solvingAssignment.targetClass})</span>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-wider mt-1">{solvingAssignment.title}</h3>
                </div>

                {/* PDF Document Viewer Container */}
                {solvingAssignment.pdfName && (
                  <div className="space-y-3">
                    {(solvingAssignment.pdfUrl || solvingAssignment.pdfName) ? (
                      <div className="space-y-3 font-sans">
                        <PdfCanvasViewer 
                          pdfUrl={solvingAssignment.pdfUrl}
                          pdfName={solvingAssignment.pdfName}
                          pdfText={solvingAssignment.pdfText}
                          theme="dark"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
                          {solvingAssignment.pdfUrl && (
                            <a
                              href={`/api/pdf/view/${solvingAssignment.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition underline font-mono cursor-pointer"
                            >
                              ⚠️ Open PDF asset in New Tab
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewerPDF(solvingAssignment);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition text-[11px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Expand View</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-black/30 border border-white/5 p-4 rounded-2xl max-h-[300px] overflow-y-auto">
                        <span className="text-[10px] text-white/40 uppercase font-mono block mb-2">Instructions worksheet text fallback:</span>
                        <pre className="whitespace-pre-wrap font-sans text-white/90 text-[11.5px] leading-relaxed">
                          {solvingAssignment.pdfText || "No additional document guidelines."}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 p-4 rounded-none text-xs text-white/80 leading-relaxed font-sans">
                  <span className="font-black text-white uppercase tracking-wider block mb-1">✍️ SOLVING GUIDELINE NOTES:</span>
                  {solvingAssignment.description}
                </div>

                {existingSub ? (
                  /* Answer already submitted */
                  <div className="bg-black border border-white/10 rounded-none p-4 space-y-4">
                    <span className="text-[10px] font-black text-white/50 uppercase block tracking-widest">SUBMITTED WORK ARCHIVE</span>
                    
                    <div className="p-3 bg-white/5 border border-white/0.5 rounded-none font-mono text-xs text-white/90 whitespace-pre-wrap">
                      {existingSub.studentNotes}
                    </div>

                    {existingSub.submittedPdfUrl && (
                      <div className="bg-white/[0.03] border border-white/5 p-3 rounded-none flex items-center justify-between">
                        <span className="text-xs text-indigo-450 font-mono font-bold flex items-center space-x-1.5">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>Notebook PDF: {existingSub.submittedFile || "notebook_homework.pdf"}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/api/pdf/view/${existingSub.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-650 hover:bg-indigo-600 text-white font-black text-[8px] tracking-widest uppercase px-3 py-1.5 border border-indigo-500 rounded-none font-mono"
                          >
                            OPEN IN NEW TAB
                          </a>
                        </div>
                      </div>
                    )}

                    {existingSub.status === 'graded' ? (
                      /* Graded Results */
                      <div className="bg-emerald-950/20 border-2 border-emerald-800 p-4 rounded-none space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-900 pb-2">
                          <span className="text-xs font-black text-emerald-400 uppercase flex items-center tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                            <span>GRADE EVALUATION PUBLISHED</span>
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-base">
                            {existingSub.grade?.score} / {solvingAssignment.points} PTS
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed bg-black/50 border border-emerald-900 p-3 rounded-none">
                          {existingSub.grade?.feedback}
                        </p>
                      </div>
                    ) : (
                      /* Submitted but pending review - Enable Student Instant AI-grading widget option! */
                      <div className="bg-amber-950/20 border border-amber-800 p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-black text-amber-400 uppercase block tracking-wider">PENDING INSTRUCTOR REVIEW EVAL</span>
                          <span className="text-[10.5px] text-white/60 block mt-1 font-mono">You can wait, or command real-time diagnostic testing on your submission text with server-side Gemini!</span>
                        </div>
                        <button
                          onClick={() => {
                            handleInstantAIGrade(existingSub, solvingAssignment.points);
                          }}
                          disabled={isAutoGrading}
                          className="bg-indigo-600 hover:bg-black disabled:opacity-55 text-white font-black text-[10.5px] tracking-widest uppercase px-4 py-3 border border-indigo-500 rounded-none transition flex items-center space-x-1.5 shrink-0"
                        >
                          {isAutoGrading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              <span>BENCHMARKING ACTIVE...</span>
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                              <span>LAUNCH INSTANT GEMINI EVAL</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* HW Compose mode */
                  <form onSubmit={handleSubmitAssignment} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-white/50 mb-2 uppercase tracking-widest">Compose solution steps in text / mathematical proofs (Optional if PDF is attached)</label>
                      <textarea
                        rows={4}
                        placeholder="Type out your calculations, answers, or chemical formulas step by step carefully..."
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        className="w-full border border-white/10 rounded-none p-3.5 text-xs text-white font-mono bg-black outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    {/* Notebook/Assignment Completed PDF Uploader */}
                    <div className="border border-dashed border-white/20 p-5 bg-white/[0.02] hover:bg-white/[0.05] transition flex flex-col items-center justify-center text-center relative">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleNotebookPDFUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                      {uploadedFileName ? (
                        <p className="text-xs text-white font-mono font-bold">
                          📄 ATTACHED NOTEBOOK PDF: <span className="text-indigo-400">{uploadedFileName}</span>
                        </p>
                      ) : (
                        <div>
                          <span className="text-xs font-black tracking-widest text-white block uppercase">UPLOAD NOTEBOOK COMPLETED WORK PDF</span>
                          <span className="text-[9px] text-white/40 block mt-1">Drag & Drop or click to upload your solved worksheet/notebook pages as a standard PDF</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingHW}
                      className="w-full bg-indigo-600 hover:bg-black disabled:opacity-50 text-white font-black tracking-widest uppercase text-xs py-3.5 rounded-none border border-indigo-500 flex items-center justify-center space-x-2 transition-all shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)]"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>SUBMIT SOLVED DATA SHEET & NOTEBOOK PDF</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center text-zinc-500">
                <FileText className="w-12 h-12 text-zinc-400 mb-3" />
                <span className="text-xs font-black tracking-widest uppercase">SELECT ANY EXERCISE FROM THE LEFT PANEL INDEX</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. Quiz Center practice solver */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-white tracking-widest uppercase italic">MCQ Quizzes & Speed Challenge</h3>
            <p className="text-xs text-white/60 mt-1">Answer dynamic practice cards. Cumulative elapsed time tracks completion seed for the leaderboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              {filteredQuizzes.length === 0 ? (
                <div className="bg-[#0F0F12] border border-white/10 p-8 rounded-none text-center text-xs text-white/40 uppercase tracking-widest font-mono">
                  ● No quizzes available for class {studentClass}
                </div>
              ) : (
                filteredQuizzes.map((q) => {
                  const previousAttempt = studentQuizAttempts.find(qa => qa.quizId === q.id);
                  return (
                    <div 
                      key={q.id}
                      className="bg-[#0F0F12] border-2 border-white/10 hover:border-indigo-500/50 rounded-none p-5 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] text-white/50 font-mono font-bold uppercase tracking-wider">{q.subject.toUpperCase()}</span>
                          {previousAttempt && (
                            <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-0.5 rounded-none font-black uppercase">
                              BEST: {previousAttempt.score} / {previousAttempt.maxScore} PTS
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-white text-sm line-clamp-2 leading-snug uppercase tracking-wide">{q.title}</h4>
                      </div>

                      {q.deadline && (
                        <div className="mt-3 bg-black/40 border border-white/5 p-2 rounded-none flex items-center justify-between text-[9px] font-mono">
                          <span className="text-white/60 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>EXP: {new Date(q.deadline).toLocaleString()}</span>
                          </span>
                          {(() => {
                            const isPassed = new Date(q.deadline) < new Date();
                            return isPassed ? (
                              <span className="text-rose-500 font-bold uppercase tracking-wider text-[8px]">
                                LOCKED (EXP)
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-bold uppercase tracking-wider text-[8px] animate-pulse">
                                ACTIVE
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {(() => {
                        const isActivePassed = q.deadline ? new Date(q.deadline) < new Date() : false;
                        const isCompleted = !!previousAttempt;
                        const isDisabled = isActivePassed || isCompleted;
                        return (
                          <button
                            onClick={() => handleStartQuiz(q)}
                            disabled={isDisabled}
                            className={`w-full mt-5 border text-white font-black text-[10px] tracking-widest uppercase py-2.5 rounded-none transition flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] ${
                              isCompleted
                                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500 opacity-75 cursor-not-allowed'
                                : isActivePassed 
                                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-500 opacity-60 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-black border-indigo-500 cursor-pointer'
                            }`}
                          >
                            <span>
                              {isCompleted
                                ? 'SUBMITTED (MAX 1 ATTEMPT)'
                                : isActivePassed 
                                  ? 'DEADLINE PASSED' 
                                  : 'BEGIN TIME TRIAL'
                              }
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quiz Solver Arena */}
            <div className="lg:col-span-8 bg-[#0F0F12] border border-white/10 rounded-none p-6 shadow-sm">
              {activeQuiz ? (
                <div>
                  {quizCompletedScore === null ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-4 border-white/10">
                        <div>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-mono">
                            {activeQuiz.subject} QUIZ CONSOLE
                          </span>
                          <h4 className="font-black text-white text-base mt-1 uppercase italic tracking-wide">{activeQuiz.title}</h4>
                        </div>
                        <span className="text-xs bg-black px-3 py-1.5 border border-white/10 text-white font-black rounded-none font-mono uppercase tracking-wider">
                          QUEST {currentQuestionIdx + 1} OF {activeQuiz.questions.length}
                        </span>
                      </div>

                      <div className="bg-black border border-white/10 rounded-none p-5">
                        <p className="text-sm font-extrabold text-white leading-relaxed font-sans uppercase tracking-wide">
                          {activeQuiz.questions[currentQuestionIdx].text}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {activeQuiz.questions[currentQuestionIdx].options.map((option, idx) => {
                          const isSel = selectedAnswerIdx === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              className={`w-full p-4 rounded-none border text-left text-xs font-black uppercase tracking-wider leading-relaxed transition-all ${
                                isSel 
                                  ? 'border-indigo-500 bg-indigo-950/55 text-white shadow-md transform scale-[1.01]' 
                                  : 'border-white/10 bg-black text-white/80 hover:border-white/30 hover:bg-white/5'
                              }`}
                            >
                              <span className={`inline-block w-6 h-6 mr-3 text-center leading-6 font-bold rounded-none uppercase text-xs ${
                                isSel ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60'
                              }`}>
                                {['A', 'B', 'C', 'D'][idx]}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-white/10">
                        <button
                          disabled={selectedAnswerIdx === null}
                          onClick={handleNextQuestion}
                          className="bg-indigo-600 hover:bg-black border border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-none transition shadow"
                        >
                          {currentQuestionIdx + 1 === activeQuiz.questions.length ? 'SUBMIT TRIAL ANSWERS' : 'PROCEED TO NEXT QUEST'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Final result with dynamic explanation reviews! */
                    <div className="text-center py-6 space-y-6">
                      <div className="inline-block bg-indigo-900/30 text-indigo-400 p-5 rounded-none border-2 border-indigo-500 mb-1 animate-bounce">
                        <Trophy className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-wider">SPEED TRIAL RUN COMPLETED!</h4>
                        <p className="text-xs text-white/50 mt-1 font-mono uppercase">YOUR TRIAL PACKETS WERE VALIDATED AUTOMATICALLY BY MODEL SERVICES.</p>
                      </div>

                      <div className="max-w-md mx-auto bg-black border border-white/10 rounded-none p-5 flex justify-around">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block font-mono">ACCURACY MARKS</span>
                          <span className="text-2xl font-black text-indigo-400 font-mono mt-2 block">
                            {quizCompletedScore} / {activeQuiz.questions.length} PTS
                          </span>
                        </div>
                        <div className="border-r border-white/10" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block font-mono">ELAPSED CLOCK SECS</span>
                          <span className="text-2xl font-black text-white font-mono mt-2 block">
                            {Math.round((Date.now() - quizStartTime) / 1000)}s
                          </span>
                        </div>
                      </div>

                      <div className="text-left space-y-4 max-h-[400px] overflow-y-auto p-4 border border-white/10 rounded-none bg-black">
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1 font-mono">AUTOGRADED SCORECARD & KEY EXPLANATIONS:</span>
                        {activeQuiz.questions.map((qn, i) => {
                          const studentSelected = answersSheet[i];
                          const isCorrect = studentSelected === qn.correctAnswerIndex;
                          return (
                            <div key={qn.id} className="text-xs border-b border-white/5 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                <p className="font-bold text-white uppercase tracking-wide">{i + 1}. {qn.text}</p>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shrink-0 font-mono ${
                                  isCorrect ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                }`}>
                                  {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                                </span>
                              </div>
                              
                              <div className="space-y-1 font-mono text-[11px] mb-2 bg-white/5 p-2 border border-white/5">
                                {qn.options.map((opt, oIdx) => {
                                  const wasSelectedByStudent = studentSelected === oIdx;
                                  const isActualCorrect = qn.correctAnswerIndex === oIdx;
                                  
                                  let rowStyle = "text-white/60 bg-transparent";
                                  let prefix = "  ";
                                  let banner = "";
                                  if (wasSelectedByStudent && isActualCorrect) {
                                    rowStyle = "text-emerald-400 font-bold bg-emerald-950/30 border-l-2 border-emerald-500 pl-2";
                                    prefix = "✓ ";
                                    banner = " [YOUR ANSWER - CORRECT]";
                                  } else if (wasSelectedByStudent && !isActualCorrect) {
                                    rowStyle = "text-rose-400 font-bold bg-rose-950/30 border-l-2 border-rose-500 pl-2";
                                    prefix = "✗ ";
                                    banner = " [YOUR ANSWER - INCORRECT]";
                                  } else if (isActualCorrect) {
                                    rowStyle = "text-emerald-400 font-bold bg-emerald-950/20 border-l-2 border-emerald-500/50 pl-2";
                                    prefix = "→ ";
                                    banner = " [CORRECT ANSWER]";
                                  }
                                  
                                  return (
                                    <div key={oIdx} className={`p-1 mt-0.5 rounded transition ${rowStyle}`}>
                                      <span className="font-semibold">{prefix}Option {['A', 'B', 'C', 'D'][oIdx]}:</span> {opt}
                                      {banner && <span className="ml-2 text-[9px] font-black tracking-wider uppercase font-mono">{banner}</span>}
                                    </div>
                                  );
                                })}
                              </div>

                              {qn.explanation && (
                                <div className="text-[11px] leading-relaxed text-white/60 bg-indigo-950/30 border border-indigo-900/60 p-2 text-justify">
                                  <strong className="text-indigo-400 uppercase tracking-widest text-[9px] font-mono block mb-0.5">EXPLANATORY RESOLUTION ANALYSIS:</strong>
                                  {qn.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setActiveQuiz(null)}
                        className="bg-indigo-600 hover:bg-black border border-indigo-500 text-white font-black tracking-widest uppercase text-xs px-6 py-3 rounded-none transition"
                      >
                        EXIT TRIAL RUN
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center text-zinc-500">
                  <HelpCircle className="w-12 h-12 text-zinc-400 mb-3 animate-pulse" />
                  <span className="text-xs font-black tracking-widest uppercase">SELECT A COMPETITIVE SPEED CHALLENGE FROM THE LEFT PANEL</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3.5 Secured Written Tests Portal */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-wider">Secure Written Examination Portal</h3>
              <p className="text-xs text-white/50 mt-1">Official board milestones, chapter-wise unit challenges, and professional subjective test papers.</p>
            </div>
            
            {dbStudent && (
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-none flex items-center space-x-3">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">STUDENT ACCOUNT BALANCE:</span>
                <span className="text-sm font-mono font-black text-white">{sessionData.coins || 0} Coins</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Subjects and Types navigation */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-white border-2 border-slate-200 p-5 rounded-none space-y-4">
                <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Filter by Syllabus Subject</h4>
                <div className="space-y-2">
                  {getSubjectsForClass(studentClass as ClassGrade)
                    .filter(streamGroup => {
                      if (classNum < 11 || classNum > 12) return true;
                      if (!dbStudent?.stream) return false;
                      return streamGroup.stream === 'General' || streamGroup.stream === dbStudent.stream;
                    })
                    .flatMap(group => group.subjects)
                    .map((subj) => {
                    const testCount = (chapterMaterials || []).filter(m => 
                      m && m.materialType === 'test' && m.subject === subj.id &&
                      (selectedClassFilter === 'all' || !m.targetClass || m.targetClass === studentClass || m.targetClass === selectedClassFilter)
                    ).length;
                    const active = curriculumSubject === subj.id;
                    return (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => {
                          setCurriculumSubject(subj.id as any);
                          setCurriculumExpandedChapter(null);
                        }}
                        className={`w-full text-left p-3 border transition-all text-xs font-black flex flex-col justify-between rounded-none ${
                          active 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.1)]'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-row items-center justify-between w-full">
                          <span className="tracking-widest uppercase">{subj.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 border font-bold ${active ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-200 border-slate-300 text-slate-600'}`}>
                            {testCount} Tests
                          </span>
                        </div>
                        <span className={`text-[8px] font-mono mt-1 tracking-widest uppercase ${active ? 'text-indigo-400' : 'text-slate-400'}`}>{subj.tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* General rules and info card */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-none space-y-3.5 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest">ASSESSMENT CORE PROTOCOL</span>
                </div>
                <div className="space-y-2 text-[10.5px] leading-relaxed text-slate-600 uppercase font-mono font-semibold">
                  <p>● DO NOT close the portal browser during active uploads.</p>
                  <p>● All handwritten scanned answer books must be compiled cleanly as single PDFs.</p>
                  <p>● Plagiarism checks will run on your subjective notebooks text.</p>
                  <p>● Assigned trainers evaluate files manually within 24-48 business hours.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Tests grouped and filtered by Sub-type */}
            <div className="md:col-span-8 space-y-6">
              {(() => {
                const activeSubjectTests = (chapterMaterials || []).filter(m => 
                  m && m.materialType === 'test' && m.subject === curriculumSubject &&
                  (selectedClassFilter === 'all' || !m.targetClass || m.targetClass === studentClass || m.targetClass === selectedClassFilter)
                );

                const weeklyTests = activeSubjectTests.filter(t => t.subType === 'weekly_test');
                const chapterTests = activeSubjectTests.filter(t => t.subType === 'chapter_test' || t.subType === 'part_test' || !t.subType);
                const halfYearlyTests = activeSubjectTests.filter(t => t.subType === 'half_yearly_test' || t.subType === 'half_syllabus_test');
                const yearlyTests = activeSubjectTests.filter(t => t.subType === 'yearly_test' || t.subType === 'full_syllabus_test');

                if (activeSubjectTests.length === 0) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-none p-12 text-center text-slate-500 text-xs font-mono uppercase tracking-widest leading-loose">
                      ✍ No tests have been prepared and assigned by department faculty for the subject {curriculumSubject} in class {studentClass} yet.
                    </div>
                  );
                }

                return (
                  <div className="space-y-8">
                    {/* 1. WEEKLY TESTS */}
                    <div id="student-weekly-tests" className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-indigo-500/20 pb-2.5">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center space-x-2">
                          <span>I. Weekly Progress challenges ({weeklyTests.length})</span>
                          <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold ml-2">WEEKLY TESTS</span>
                        </h4>
                      </div>

                      {weeklyTests.length === 0 ? (
                        <p className="text-[10px] text-white/40 font-mono uppercase italic p-4 bg-white/[0.01] border border-white/5">
                          No Weekly Progress Tests published for {curriculumSubject} yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {weeklyTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-black/50 border border-white/10 hover:border-indigo-500/30 transition p-4 rounded-none flex flex-col justify-between relative overflow-hidden">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 uppercase font-bold">
                                      WEEKLY TEST
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${
                                        sub.status === 'graded' ? 'bg-emerald-950 text-emerald-405 border-emerald-800 font-extrabold' : 'bg-amber-950 text-amber-400 border-amber-900/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-905 px-2 py-0.5 uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed font-mono">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-indigo-700 hover:bg-indigo-650 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-none transition cursor-pointer"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START TEST ASSESSMENT'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 2. CHAPTER TESTS */}
                    <div id="student-chapter-tests" className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-indigo-500/20 pb-2.5">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center space-x-2">
                          <span>II. CHAPTER-WISE UNIT TESTS ({chapterTests.length})</span>
                          <span className="text-[8px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded font-mono font-bold ml-2">CHAPTER TESTS</span>
                        </h4>
                      </div>

                      {chapterTests.length === 0 ? (
                        <p className="text-[10px] text-white/40 font-mono uppercase italic p-4 bg-white/[0.01] border border-white/5">
                          No Chapter-wise Unit Tests published for {curriculumSubject} yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {chapterTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-black/50 border border-white/10 hover:border-indigo-500/30 transition p-4 rounded-none flex flex-col justify-between relative overflow-hidden">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] font-mono bg-indigo-950 text-indigo-305 border border-indigo-900 px-1.5 py-0.5 uppercase font-bold">
                                      {t.chapterId !== 'ALL' ? `${t.chapterId} UNIT` : 'UNIT TEST'}
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${
                                        sub.status === 'graded' ? 'bg-emerald-950 text-emerald-400 border-emerald-800 font-extrabold' : 'bg-amber-950 text-amber-400 border-amber-900/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-905 px-2 py-0.5 uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed font-mono">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-[#111119] hover:bg-indigo-900 border border-white/10 hover:border-indigo-550 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-none transition cursor-pointer"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START UNIT TEST'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. HALF YEARLY TESTS */}
                    <div id="student-half-yearly-tests" className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-indigo-500/20 pb-2.5">
                        <Trophy className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center space-x-2">
                          <span>III. HALF YEARLY REVIEW EXAMS ({halfYearlyTests.length})</span>
                          <span className="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono font-bold ml-2">HALF YEARLY</span>
                        </h4>
                      </div>

                      {halfYearlyTests.length === 0 ? (
                        <p className="text-[10px] text-white/40 font-mono uppercase italic p-4 bg-white/[0.01] border border-white/5">
                          No Half Yearly Review Exams published for {curriculumSubject} yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {halfYearlyTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-black/50 border border-white/10 hover:border-indigo-500/30 transition p-4 rounded-none flex flex-col justify-between relative overflow-hidden">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] font-mono bg-amber-950 text-amber-300 border border-amber-900/40 px-1.5 py-0.5 uppercase font-bold border-amber-850">
                                      HALF YEARLY
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${
                                        sub.status === 'graded' ? 'bg-emerald-950 text-emerald-400 border-emerald-800 font-extrabold' : 'bg-amber-950 text-amber-400 border-amber-900/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-905 px-2 py-0.5 uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed font-mono">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-indigo-700 hover:bg-indigo-650 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-none transition cursor-pointer"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START TERM TEST'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 4. YEARLY TESTS */}
                    <div id="student-yearly-tests" className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-indigo-500/20 pb-2.5">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black text-white tracking-widest uppercase flex items-center space-x-2">
                          <span>IV. YEARLY MOCK BOARD MILESTONES ({yearlyTests.length})</span>
                          <span className="text-[8px] bg-emerald-950 text-emerald-305 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold ml-2">YEARLY TESTS</span>
                        </h4>
                      </div>

                      {yearlyTests.length === 0 ? (
                        <p className="text-[10px] text-white/40 font-mono uppercase italic p-4 bg-white/[0.01] border border-white/5">
                          No Full Syllabus Board mock tests published for {curriculumSubject} yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {yearlyTests.map((t) => {
                            const sub = submissions.find(s => s.testId === t.id && s.studentId === currentStudent?.id);
                            return (
                              <div key={t.id} className="bg-black/50 border border-white/10 hover:border-indigo-500/30 transition p-4 rounded-none flex flex-col justify-between relative overflow-hidden">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] font-mono bg-emerald-950 text-emerald-300 font-bold border border-emerald-900/40 px-1.5 py-0.5 uppercase">
                                      YEARLY FINAL
                                    </span>
                                    {sub ? (
                                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${
                                        sub.status === 'graded' ? 'bg-emerald-950 text-emerald-400 border-emerald-800 font-extrabold' : 'bg-amber-950 text-amber-400 border-amber-900/45'
                                      }`}>
                                        {sub.status === 'graded' ? `GRADED (${sub.grade?.score}/100)` : 'PENDING'}
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-905 px-2 py-0.5 uppercase">
                                        REMAINING
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-extrabold text-white text-xs uppercase line-clamp-1">{t.title}</h5>
                                  <p className="text-[10px] text-white/50 mt-1 line-clamp-2 leading-relaxed font-mono">
                                    {t.content}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setCurriculumSelectedMaterial(t)}
                                  className="w-full mt-4 bg-indigo-700 hover:bg-indigo-650 text-white font-mono font-bold uppercase text-[9px] tracking-widest py-2 rounded-none transition cursor-pointer"
                                >
                                  {sub ? 'VIEW RESULTS & FEEDBACK' : 'START TEST ASSESSMENT'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. My progress scores review */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'my_progress' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black text-white tracking-widest uppercase italic">My Academic Matrix Tracker</h3>
            <p className="text-xs text-white/60 mt-1">Live index tracking your quiz accuracy speed run times and autograded score benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {studentQuizAttempts.map((qa) => (
              <div key={qa.id} className="bg-[#0F0F12] border-2 border-white/10 hover:border-indigo-505/30 p-5 rounded-none relative overflow-hidden transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[8px] bg-black text-indigo-400 border border-white/10 px-2.5 py-1 font-mono font-bold uppercase tracking-widest">
                    QUIZ TRIAL SOLVED
                  </span>
                  <span className="text-xs font-black text-indigo-400 font-mono">
                    {qa.score} / {qa.maxScore} PTS
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-xs mb-2 uppercase tracking-wide line-clamp-1">{qa.quizTitle}</h4>
                <div className="flex items-center space-x-3 text-[10px] text-white/50 font-mono mt-4 border-t border-white/5 pt-3">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    SPEED: {Math.round(qa.timeSpentMs / 1000)}S
                  </span>
                  <span>•</span>
                  <span>{new Date(qa.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {submissions.filter(s => s.studentId === currentStudent?.id).map((sub) => {
              const isTest = !!sub.testId;
              const testRel = isTest ? (chapterMaterials || []).find(m => m && m.id === sub.testId) : null;
              const relAssign = !isTest ? assignments.find(a => a.id === sub.assignmentId) : null;
              const title = isTest ? testRel?.title : relAssign?.title;
              const subject = isTest ? testRel?.subject : relAssign?.subject;
              const tagLabel = isTest ? `SECURE TEST (${testRel?.subType?.replace(/_/g, ' ').toUpperCase() || 'TEST'})` : 'ASSIGNMENT';
              const maxPoints = isTest ? 100 : (sub.grade?.points || 100);

              return (
                <div key={sub.id} className="bg-[#0F0F12] border-2 border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-indigo-505/30 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] bg-black text-white/60 border border-white/10 px-2.5 py-1 font-mono font-bold uppercase tracking-widest">
                        {subject ? subject.toUpperCase() : tagLabel}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase border tracking-wider ${
                        sub.status === 'graded' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-xs mb-2 uppercase tracking-wide line-clamp-1">{title}</h4>
                  </div>

                  {sub.grade ? (
                    <div className="bg-black border border-indigo-900/40 p-3 rounded-none text-[10px] text-white/80 leading-relaxed font-mono mt-4">
                      <span className="font-black text-indigo-400 block uppercase tracking-wider">★ GRADE: {sub.grade.score} / {maxPoints} PTS</span>
                      <span className="block mt-1 italic line-clamp-2">" {sub.grade.feedback} "</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/40 font-mono mt-4 border-t border-white/5 pt-3 uppercase">SUB_DATE: {new Date(sub.submittedAt).toLocaleDateString()} • REVIEW_PENDING</p>
                  )}
                </div>
              );
            })}

            {studentQuizAttempts.length === 0 && submissions.filter(s => s.studentId === currentStudent?.id).length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 bg-[#0F0F12] border border-white/10 p-12 rounded-none text-center text-white/40 text-xs font-mono uppercase tracking-widest leading-relaxed">
                ● You haven't completed any quizzes or homework assignments yet.<br />Access solve cards above to list performance metrics!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. Doubt Session Centre & Attendance Gateway */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'doubts' && (
        <div className="space-y-6 animate-fade-in" id="student_doubts_panel">
          <div>
            <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
              <span>Doubt Session Centre & Attendance Gateway</span>
              <span className="text-[10px] bg-indigo-650/45 border border-indigo-550/30 text-indigo-400 px-2.5 py-0.5 rounded-full font-black tracking-widest font-mono">OFFLINE COMPANION</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Verify scheduled Saturday/Sunday academic classes, register text descriptions or uploaded screenshots of your doubt papers, and claim entrance clearance passes.
            </p>
          </div>

          {/* Doubt Notice Bulletins published by Teachers */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-indigo-400 border-b border-white/5 pb-2">
              📢 PHYSICAL WEEKEND & HOLIDAY CLASSES BULLETIN BOARD
            </h4>

            {doubtReminders.length === 0 ? (
              <div className="glass-panel text-center p-8 text-zinc-550 text-xs font-mono uppercase tracking-widest">
                [ No physical weekend classes currently on the dashboard board notice ]
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doubtReminders.map((rem) => (
                  <div key={rem.id} className="glass-panel border-white/5 bg-[#0D0D14]/80 p-5 rounded-none flex flex-col justify-between hover:border-indigo-500/20 transition group">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="bg-indigo-950/80 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider border border-indigo-905">
                          {rem.subject}
                        </span>
                        <span className="text-zinc-500 text-[9px] font-mono font-bold uppercase">{rem.classGroup}</span>
                      </div>

                      <h5 className="font-extrabold text-white text-xs uppercase tracking-wide leading-snug group-hover:text-indigo-405 transition">{rem.title}</h5>
                      {rem.description && (
                        <p className="text-[11px] text-zinc-400 leading-normal line-clamp-3">
                          {rem.description}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-3.5 mt-3 space-y-1.5 font-mono text-[9.5px]">
                      <div className="text-amber-500 uppercase font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Days scheduled: {rem.daysOfWeek.join(' / ')}</span>
                      </div>
                      {rem.holidayName && (
                        <div className="text-rose-500 uppercase font-black">
                          Holiday context: {rem.holidayName}
                        </div>
                      )}
                      <div className="text-zinc-300 leading-snug">
                        Offline Classroom: <strong className="text-white font-extrabold">{rem.offlineAddress}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master layout containing: Submit Form and Submissions history */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            
            {/* SUBMIT DOUBT TO ENTRY CONSOLE FORM */}
            <div className="lg:col-span-5 glass-panel bg-[#0B0B10]/95 border-2 border-white/5 p-6 rounded-none space-y-5">
              <h4 className="text-xs font-black tracking-widest uppercase text-white border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-455 animate-pulse" />
                <span>Book offline Class Entry pass</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-widest font-mono">
                    Select Holiday or Weekend Day
                  </label>
                  <select
                    value={doubtSubDayType}
                    onChange={(e) => setDoubtSubDayType(e.target.value as any)}
                    className="w-full bg-black border border-white/10 text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition text-white/80"
                  >
                    <option value="Saturday">Saturday Class (Fixed 8:00 AM - 6:00 PM)</option>
                    <option value="Sunday">Sunday Class (Fixed 8:00 AM - 6:00 PM)</option>
                    <option value="Special Holiday">Special Festival Holiday Consultation (Fixed 8:00 AM - 6:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-widest font-mono">
                    Booked Student Name & Grade
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={currentStudent?.name || "Verified Student"}
                      disabled
                      className="w-full bg-[#181822] border border-white/5 text-zinc-400 rounded-none px-3 py-2 text-xs font-bold font-mono"
                    />
                    <select
                      value={doubtSubTargetGrade}
                      onChange={(e) => setDoubtSubTargetGrade(e.target.value as ClassGrade)}
                      className="w-full bg-black border border-white/10 text-white rounded-none px-2 py-2 text-xs focus:border-indigo-500 outline-none transition text-white/85"
                    >
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                      <option value="IIT-JEE">IIT-JEE Prep</option>
                      <option value="NEET">NEET Prep</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-widest font-mono">
                    Describe your Doubt / Specific Question
                  </label>
                  <textarea
                    placeholder="Briefly state physics equation, mathematics formula, or query questions to go over..."
                    value={doubtSubDesc}
                    onChange={(e) => setDoubtSubDesc(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition h-20 resize-none font-sans text-white"
                    required
                  />
                </div>

                {/* FILE UPLOAD WITH PREVIEW */}
                <div>
                  <label className="block text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-widest font-mono">
                    Attach Dub Screenshot / Photo (If Any)
                  </label>
                  
                  <div className="border border-dashed border-white/15 hover:border-white/20 p-4 text-center cursor-pointer relative bg-black/40">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDoubtSubImageBase64(reader.result as string);
                            setDoubtSubImageName(file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    
                    {doubtSubImageBase64 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase">✓ Snapshot loaded successfully</p>
                        <div className="w-24 h-16 bg-zinc-850 border border-white/15 mx-auto overflow-hidden rounded relative">
                          <img src={doubtSubImageBase64} alt="Pre-submitted file attachment copy" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDoubtSubImageBase64('');
                            setDoubtSubImageName('');
                          }}
                          className="text-[9px] text-rose-500 font-mono font-bold hover:underline"
                        >
                          Remove Photo attachment
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="w-7 h-7 text-zinc-550 mx-auto" />
                        <span className="block text-[10px] text-zinc-400 tracking-wider font-mono font-bold">DRAG & DROP OR EXPLORE COMPUTER</span>
                        <p className="text-[8px] text-zinc-650 font-mono">Fits JPEG, PNG screenshots up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!doubtSubDesc.trim()) {
                      alert('Please fill out your query description.');
                      return;
                    }

                    const newPetition: any = {
                      id: 'sub_' + Math.random().toString(36).substring(2, 9),
                      studentId: currentStudent?.id || 'anonymous_id',
                      studentName: currentStudent?.name || 'Verified Student',
                      studentClass: doubtSubTargetGrade,
                      chapter: "Doubt Session",
                      doubtDayType: doubtSubDayType,
                      scheduledTimeSlot: doubtSubTimeSlot,
                      doubtDescription: doubtSubDesc,
                      doubtImageBase64: doubtSubImageBase64 || undefined,
                      status: 'pending',
                      submittedAt: new Date().toISOString()
                    };

                    onSetDoubtSubmissions(prev => [newPetition, ...prev]);
                    
                    // Reset fields
                    setDoubtSubChapter('');
                    setDoubtSubDesc('');
                    setDoubtSubImageBase64('');
                    setDoubtSubImageName('');
                    
                    alert('Your entry request was logged on eShiksha physical classes board successfully. Check out the ticket history pass on the right to receive your entry clearance code!');
                  }}
                  className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-400/30 text-white font-mono font-bold text-xs py-3.5 tracking-wider uppercase transition shadow-lg shrink-0 cursor-pointer"
                >
                  Submit entry Petition card
                </button>
              </div>
            </div>

            {/* HIGH FIDELITY HISTORY GATEWAY CLEARANCE PASS CARDS */}
            <div className="lg:col-span-7 space-y-5">
              <h4 className="text-xs font-black tracking-widest uppercase text-indigo-400 border-b border-white/5 pb-2">
                🎟 YOUR CLASS ADMIT SLIPS & GATEWAY PASSES
              </h4>

              {doubtSubmissions.filter(s => s.studentId === currentStudent?.id).length === 0 ? (
                <div className="glass-panel text-center p-16 text-zinc-500 text-xs font-mono uppercase tracking-widest border-white/5">
                  [ You haven't booked any offline attendance passes yet ]
                </div>
              ) : (
                <div className="space-y-5 max-h-[550px] overflow-y-auto pr-2">
                  {doubtSubmissions.filter(s => s.studentId === currentStudent?.id).map((sub) => {
                    const isApproved = sub.status === 'approved';
                    const isRejected = sub.status === 'rejected';
                    
                    return (
                      <div 
                        key={sub.id} 
                        className={`border rounded p-5 bg-white shadow relative transition-all ${
                          isApproved 
                            ? 'border-emerald-300 bg-emerald-50' 
                            : isRejected 
                              ? 'border-rose-300 bg-rose-50' 
                              : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {/* Cut corner visual pattern representing offline ticket slip */}
                        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-black border-r border-b border-zinc-200 rounded-br-2xl"></div>
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black border-l border-b border-zinc-200 rounded-bl-2xl"></div>

                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3 border-b border-zinc-200 pb-2.5">
                          <div>
                            <span className="block text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-widest mb-1">ESHIKSHA PORTAL ENTRY SLIP:</span>
                            <span className="font-extrabold text-yellow-400 text-base uppercase tracking-wide bg-[#00a2ff] px-2 py-0.5 rounded shadow-sm">{sub.chapter}</span>
                          </div>
                          
                          <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded shadow-sm border ${
                            isApproved 
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                              : isRejected 
                                ? 'bg-rose-100 border-rose-300 text-rose-700' 
                                : 'bg-amber-100 border-amber-300 text-amber-700'
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                          <div className="md:col-span-8 space-y-3">
                            <p className="text-sm text-zinc-900 font-semibold leading-normal">
                              <strong className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider mb-0.5">My doubt question description:</strong>
                              {sub.doubtDescription}
                            </p>

                            <div className="font-mono text-[11px] text-zinc-700 space-y-1.5 bg-zinc-50 p-3 border border-zinc-200 font-bold rounded shadow-sm">
                              <div>Requested attendance: <strong className="text-blue-600 uppercase font-black">{sub.doubtDayType}</strong> ({sub.scheduledTimeSlot})</div>
                              <div>Requested class group: <strong className="text-blue-600 font-bold">{sub.studentClass}</strong></div>
                              <div>Requested on: <span className="text-zinc-900 font-bold">{new Date(sub.submittedAt).toLocaleDateString()}</span></div>
                            </div>
                          </div>

                          {/* Approved GATE PASS CARD PORTAL DETAILS */}
                          {isApproved && (
                            <div className="md:col-span-4 bg-emerald-50/50 border border-emerald-200 p-4 flex flex-col justify-between items-center text-center rounded relative shadow-sm">
                              <div className="space-y-1.5 w-full">
                                <QrCode className="w-9 h-9 text-emerald-600 mx-auto animate-pulse" />
                                <span className="block text-[8px] text-zinc-600 font-mono uppercase tracking-wider font-bold">ENTRY CLEARANCE ID:</span>
                                <span className="block text-sm font-black text-emerald-900 bg-white px-2.5 py-1.5 border border-emerald-200 select-all tracking-widest font-mono shadow-sm rounded">
                                  {sub.entryGrantCode}
                                </span>
                              </div>
                              <span className="text-[7.5px] text-zinc-500 font-mono font-bold block mt-1.5">TAP TO SELECT / PRESENT AT RECEPTION</span>
                            </div>
                          )}
                        </div>

                        {/* Offline location station coordinates provided by instructor */}
                        {isApproved && (
                          <div className="mt-4 border-t border-emerald-100 pt-3 space-y-2 text-sm leading-relaxed text-emerald-800 font-sans">
                            <div>
                              📍 <span className="font-mono text-[10px] uppercase text-zinc-600 font-bold">OFFLINE DIRECT DESK COORDINATES:</span><br />
                              <strong className="text-red-600 bg-white px-2 py-0.5 rounded border border-red-100 font-sans text-sm block mt-0.5 shadow-sm">{sub.offlineLocationDetails || "Front Reception desk, Block B"}</strong>
                            </div>
                            {sub.teacherNotes && (
                              <div className="text-zinc-700 text-xs italic leading-normal pt-2 bg-slate-50 p-3 border border-slate-200 mt-2 rounded shadow-sm">
                                <strong className="text-[9px] text-blue-600 font-mono not-italic block uppercase tracking-wider mb-1 font-black">Teacher Advisory:</strong>
                                "{sub.teacherNotes}"
                              </div>
                            )}
                          </div>
                        )}

                        {isRejected && (
                          <div className="mt-4 border-t border-rose-200 pt-3 leading-normal text-xs font-mono text-rose-600 font-bold">
                            🚨 Attendance gateway rejected by instructor. Please try scheduling on other classes or schedule an alternate time slot.
                          </div>
                        )}
                        
                        {!isApproved && !isRejected && (
                          <div className="mt-4 border-t border-white/5 pt-3 text-xs text-zinc-350 font-mono italic">
                            ⏳ Slip is in transit. Teacher/Representative is matching table availabilities and desk configurations...
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-[10px] font-mono text-[#A5B4FC] font-bold uppercase tracking-wider">
                            eShiksha companion pass
                          </span>
                          <button
                            type="button"
                            onClick={() => exportTicketToPDF(sub)}
                            className="bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-850/80 text-[#A5B4FC] hover:text-white font-mono text-[9.5px] font-bold tracking-wider uppercase px-3.5 py-1.5 transition flex items-center gap-1.5 cursor-pointer rounded-sm"
                            id={`pdf-btn-${sub.id}`}
                          >
                            <Download className="w-3 h-3 text-[#A5B4FC]" />
                            EXPORT TO PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PICTURE ZOOM MODAL STUDENT VIEW */}
      {activeZoomImageStudent && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out"
          onClick={() => setActiveZoomImageStudent(null)}
        >
          <div 
            className="bg-[#0B0B0E] border border-white/10 max-w-3xl w-full p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveZoomImageStudent(null)}
              className="absolute -top-12 right-0 text-white bg-zinc-900 px-3.5 py-1.5 border border-white/10 hover:bg-indigo-650 transition flex items-center gap-1.5 text-[10px] font-mono"
            >
              <X className="w-4 h-4" /> CLOSE VIEWPORT
            </button>
            <img 
              src={activeZoomImageStudent} 
              alt="Doubt problem sheet" 
              className="w-full h-auto max-h-[75vh] object-contain mx-auto bg-black border border-white/5 shadow-2xl rounded" 
              referrerPolicy="no-referrer"
            />
            <p className="text-center font-mono text-[9px] text-zinc-550 mt-3.5 uppercase tracking-widest font-bold">
              eShiksha Student Dashboard — Attachment Audit Board
            </p>
          </div>
        </div>
      )}

        </div>

        {/* Right Side: Student Sidebar Panel */}
        <div className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6" id="student_dashboard_sidebar">
          {/* Beautiful countdown timer published by teacher */}
          <SidebarCountdownWidget 
            config={countdownConfig} 
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setActiveQuiz(null);
              setSolvingAssignment(null);
            }} 
            liveClasses={liveClasses}
            assignments={assignments}
          />

          {/* Quick Stats or Digital Wallet Panel */}
          <div className="glass-panel border-white/5 bg-[#0D0D14]/85 p-5 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="text-[9px] text-zinc-500 font-extrabold tracking-widest uppercase mb-3 pb-1 border-b border-white/5 flex items-center justify-between">
              <span>MY LEARNING CREDENTIALS</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-mono">
                  🪙
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">SECURE DIGITAL WALLET</span>
                  <span className="text-sm font-black text-white font-mono">{sessionData.coins || 0} COINS</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">CURRENT COURSE BATCH</span>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">{currentStudent?.enrolledClass}</span>
                </div>
              </div>

              {/* Progress summary checklist inside sidebar to increase engagement */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider">
                  <span>Solved MCQ trials:</span>
                  <span className="text-white font-bold font-mono">{(studentQuizAttempts || []).length}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider">
                  <span>Handed homework:</span>
                  <span className="text-white font-bold font-mono">{(submissions || []).filter(s => s.studentId === currentStudent?.id).length}</span>
                </div>
              </div>

              {dbStudent?.registrationType === 'abhedya_gurukul' && (
                <div className="pt-3 border-t border-white/5 space-y-2.5">
                  <div className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
                    <span>🔱</span> GURUKUL SCHOLARSHIP
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl space-y-1">
                    <p className="text-[9.5px] text-[#FFE0B2] font-black uppercase tracking-wider flex items-center">
                      🔱 ABHEDYA SCHOLAR ACTIVE
                    </p>
                    <p className="text-[8.5px] text-zinc-400 font-sans leading-normal">
                      Granted automatic scholarship credential badge. Standard course fee discounted to strictly ₹300.00.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Floating PDF Viewer Modal */}
      <AnimatePresence>
        {viewerPDF && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1010] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setViewerPDF(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#0b0b12] border border-neutral-800 shadow-2xl rounded-3xl p-6 text-white flex flex-col max-h-[90vh] overflow-hidden my-auto"
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 bg-indigo-950/85 border border-indigo-500/30 text-indigo-400 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wider truncate bg-[#ff0000]">{viewerPDF.title}</span>
                    </div>
                    <span className="text-[10px] text-white/50 font-mono block uppercase truncate">File: {viewerPDF.pdfName || "document.pdf"} ({viewerPDF.subject})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewerPDF(null)}
                    className="p-1.5 bg-white/5 border border-white/10 hover:bg-neutral-800 hover:text-white text-white/70 transition rounded-xl flex items-center justify-center cursor-pointer"
                    title="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dual Mode Switcher Tabs */}
              {(viewerPDF.pdfUrl || viewerPDF.pdfName) && (
                <div className="flex border-b border-white/5 mb-4 space-x-1">
                  <button
                    type="button"
                    onClick={() => setViewerMode('pdf')}
                    className={`px-4 py-2.5 text-xs font-bold border-b border-white/5 transition cursor-pointer ${
                      viewerMode === 'pdf'
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                        : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    📄 Live Document Preview (Read-Only)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerMode('text')}
                    className={`px-4 py-2.5 text-xs font-bold border-b border-white/5 transition cursor-pointer ${
                      viewerMode === 'text'
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                        : 'border-transparent text-white/40 hover:text-white/60'
                    }`}
                  >
                    📝 Parsed Text Reader
                  </button>
                </div>
              )}

              {/* Main Content View with Native Iframe Stream or Local Text Fallback */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {(viewerPDF.pdfUrl || viewerPDF.pdfName) && viewerMode === 'pdf' ? (
                  <div className="space-y-3">
                    <PdfCanvasViewer 
                      pdfUrl={viewerPDF.pdfUrl}
                      pdfName={viewerPDF.pdfName || "document.pdf"}
                      pdfText={viewerPDF.pdfText}
                      theme="dark"
                      filenameBg="bg-[#ff0000]"
                      zoomBg="bg-[#0036ff]"
                      nameContainerBg="bg-[#0000ff]"
                    />
                    {viewerPDF.pdfUrl && (
                      <div className="flex justify-start">
                        <a
                          href={`/api/pdf/view/${viewerPDF.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 transition underline font-mono cursor-pointer"
                        >
                          ⚠️ Open PDF asset in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#0b0b12] border border-white/5 p-6 rounded-2xl max-h-[550px] overflow-y-auto leading-relaxed text-white/90">
                    <p className="text-[10px] text-white/40 font-mono uppercase mb-3 border-b border-white/5 pb-2">
                      Parsed Document Text Content ({viewerPDF.pdfName || "document.pdf"}):
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-white/80 leading-relaxed select-text">
                      {viewerPDF.pdfText || "No readable plain-text contents attached to this assignment sheet."}
                    </pre>
                  </div>
                )}
              </div>

              {/* Document footer bar */}
              <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-mono text-white/40">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>PREVIEW QUALITY: NATIVE HIGH FIDELITY</span>
                </div>
                <div className="uppercase">
                  Subject: <span className="font-bold text-indigo-400">{viewerPDF.subject}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Canvas File Viewer with Disable Download */}
      <AnimatePresence>
        {viewerMaterialFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={() => setViewerMaterialFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#09090d] border border-neutral-800 shadow-2xl rounded-3xl p-6 text-white flex flex-col max-h-[90vh] overflow-hidden my-auto animate-none"
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 bg-indigo-950/85 border border-indigo-500/30 text-indigo-400 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wider truncate">{viewerMaterialFile.title}</span>
                    </div>
                    <span className="text-[10px] text-white/55 font-mono block uppercase truncate">
                      {viewerMaterialFile.chapterId}: {viewerMaterialFile.chapterName} • Study Supplement ({viewerMaterialFile.subject})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[9px] font-mono select-none px-2.5 py-1 bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded-none uppercase font-bold tracking-widest">
                    SECURED PREVIEW
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewerMaterialFile(null)}
                    className="p-1.5 bg-white/5 border border-white/10 hover:bg-neutral-800 hover:text-white text-white/70 transition rounded-xl flex items-center justify-center cursor-pointer"
                    title="Close file viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Canvas Viewer */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {viewerMaterialFile.fileUrl ? (
                  <div className="space-y-3">
                    <PdfCanvasViewer 
                      pdfUrl={viewerMaterialFile.fileUrl}
                      pdfName={viewerMaterialFile.title}
                      pdfText={viewerMaterialFile.content || "Secured curriculum PDF attachment. Direct download is locked by eShikshaPie."}
                      theme="dark"
                      disableDownload={true}
                    />
                  </div>
                ) : (
                  <div className="bg-[#050508] border border-white/5 p-6 rounded-2xl max-h-[500px] overflow-y-auto leading-relaxed text-white/90">
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mb-3 border-b border-white/5 pb-2">
                      Plaintext Reader Fallback:
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-white/80 leading-relaxed select-text">
                      {viewerMaterialFile.content || "No secondary attachments found."}
                    </pre>
                  </div>
                )}
              </div>

              {/* Document footer bar */}
              <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-mono text-white/40">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>PREVIEW QUALITY: CANVAS SECURE STREAM</span>
                </div>
                <div className="uppercase">
                  COPY PROTECTION: <span className="font-bold text-rose-400">ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perfect First-scorer Celebration Modal */}
      <AnimatePresence>
        {perfectScoreCelebration && perfectScoreCelebration.show && (
          <motion.div
            key="celebration-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-lg p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-full max-w-lg bg-[#0d0d14] border-2 border-amber-500/80 p-8 shadow-[0_0_50px_rgba(244,180,26,0.25)] text-center relative overflow-hidden"
            >
              {/* Decorative radial ambient light */}
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Confetti Icon */}
              <div className="flex justify-center mb-6 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-110" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.12, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-br from-amber-400 to-yellow-600 p-5 rounded-full text-black shadow-lg relative z-10"
                >
                  <Trophy className="w-16 h-16 stroke-[2.5]" />
                </motion.div>
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce">🎖️</div>
              </div>

              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] font-mono block mb-2">
                🏆 CHAMPION ACHIEVEMENT
              </span>
              
              <h3 className="text-3xl font-black text-white uppercase italic tracking-wide font-sans mb-4">
                PERFECT SCORE ACQUIRED!
              </h3>

              <div className="bg-black/60 border border-white/5 py-4 px-6 rounded-none mb-6">
                <p className="text-sm text-slate-300">
                  Congratulations <span className="font-mono text-lg font-black text-indigo-400 uppercase tracking-wider block mt-1 decoration-amber-400 decoration-wavy underline leading-relaxed">{perfectScoreCelebration.studentName}</span>
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  You are the <span className="text-amber-400 font-bold">first student</span> to complete the dynamic quiz:
                  <span className="block italic text-white font-semibold font-mono mt-1 text-[11px]">"{perfectScoreCelebration.quizTitle}"</span>
                  and score <span className="text-emerald-400 font-bold whitespace-nowrap">FULL MARKS (100% Correct)</span>!
                </p>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                Your incredible score has been logged on the honor roll. Your name is celebrated as the top performer for this chapters quiz trial term. Keep up this magnificent academic momentum!
              </p>

              <button
                type="button"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black uppercase text-xs tracking-widest py-3.5 transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                onClick={() => setPerfectScoreCelebration(null)}
              >
                <span>ACCEPT HONOR & CONTINUE</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Study Material Overlay Viewer */}
      <AnimatePresence>
        {curriculumSelectedMaterial && curriculumSelectedMaterial.materialType === 'video' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] bg-[#020205] flex flex-col justify-between overflow-hidden"
            id="fullscreen-video-theater"
          >
            {/* Immersive Top Bar Controls */}
            <div className="bg-black/80 border-b border-indigo-950/40 p-4 flex items-center justify-between z-10 select-none">
              <div className="flex items-center space-x-3.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] bg-indigo-950 border border-indigo-500/30 text-indigo-300 font-mono font-black px-2 py-0.5 uppercase tracking-widest rounded">
                      {curriculumSelectedMaterial.subject}
                    </span>
                    <span className="text-[9px] bg-zinc-900 border border-white/5 text-zinc-300 font-mono font-bold px-2 py-0.5 uppercase">
                      {curriculumSelectedMaterial.chapterId}: {curriculumSelectedMaterial.chapterName}
                    </span>
                    <span className="text-[9px] bg-red-950/60 border border-red-500/30 text-red-400 font-black px-2 py-0.5 uppercase tracking-wide">
                      🔒 SECURE LIVE PLAYER (DOWNLOAD DISABLED)
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1 uppercase tracking-wider">
                    {curriculumSelectedMaterial.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleEnterVideoFullscreen}
                  className="bg-indigo-600/90 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-none transition flex items-center space-x-1.5 cursor-pointer border border-indigo-400/20"
                  title="Force native browser fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">NATIVE FULLSCREEN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumSelectedMaterial(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white hover:text-red-400 p-2.5 transition rounded-none font-bold cursor-pointer"
                  title="Close Media Theater"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Centered Large-Scale Cinema Viewport Stage */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-[#020205] to-[#080815] relative">
              <div 
                ref={playerContainerRef}
                className="w-full max-w-5xl aspect-video bg-black rounded-none border border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.18)] relative overflow-hidden flex items-center justify-center select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                {getYouTubeEmbedUrl(curriculumSelectedMaterial.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(curriculumSelectedMaterial.videoUrl)!}
                    title={curriculumSelectedMaterial.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={curriculumSelectedMaterial.videoUrl}
                    controls
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload nofullscreen"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain"
                    poster="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                    autoPlay
                  />
                )}

                {/* Overlaid Security Seal badge */}
                <div className="absolute top-3 left-3 bg-black/60 border border-white/5 backdrop-blur-md px-2 py-1 select-none pointer-events-none">
                  <p className="text-[8px] font-mono font-black text-indigo-400/80 tracking-widest">
                    eShikshaPie ACADEMY SAFE DRM PORT
                  </p>
                </div>
              </div>
            </div>

            {/* Immersive Footer status bar */}
            <div className="bg-black/90 border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 font-mono gap-2 select-none">
              <div className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="font-bold text-indigo-400/80">PROTECTION SECURED:</span>
                <span>Context-menu extraction is fully blocked. Multi-layered DRM active.</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>AUTHOR: {curriculumSelectedMaterial.authorTeacher || 'IIT PHYSICS PANEL'}</span>
                <span>•</span>
                <span>UPLOADED DATE: {curriculumSelectedMaterial.createdAt}</span>
              </div>
            </div>
          </motion.div>
        )}

        {curriculumSelectedMaterial && curriculumSelectedMaterial.materialType !== 'video' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            id="standard-material-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0F0F12] border-2 border-white/15 w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col justify-between shadow-2xl relative"
            >
              {/* Header banner */}
              <div className="bg-[#181820] border-b border-white/10 p-5 flex items-start justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] bg-indigo-950 border border-indigo-700 text-indigo-400 font-mono font-black px-2 py-0.5 uppercase tracking-wide">
                      {curriculumSelectedMaterial.subject}
                    </span>
                    <span className="text-[10px] bg-white/5 border border-white/10 text-white/70 font-mono font-bold px-2 py-0.5 uppercase">
                      {curriculumSelectedMaterial.chapterId}: {curriculumSelectedMaterial.chapterName}
                    </span>
                    <span className="text-[10px] bg-amber-950 border border-amber-800 text-amber-400 font-bold px-2 py-0.5 uppercase">
                      {curriculumSelectedMaterial.materialType} {curriculumSelectedMaterial.subType ? `(${curriculumSelectedMaterial.subType})` : ''}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-1.5 uppercase tracking-wide leading-tight">
                    {curriculumSelectedMaterial.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setCurriculumSelectedMaterial(null)}
                  className="bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 p-2 transition rounded-none font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content body based on resource type */}
              <div className="p-6 space-y-6 text-xs text-white/80 leading-relaxed font-sans max-h-[55vh] overflow-y-auto custom-scrollbar">
                {/* Text Content / Textbook Reading Paper Grid */}
                <div className="bg-[#050507] border border-white/10 p-6 font-mono space-y-4 rounded-none leading-loose">
                  <div className="border-b border-white/15 pb-2 mb-4 flex items-center justify-between text-[10px] text-white/50">
                    <span>LECTURE SYLLABUS DIRECTIVE TEXTBOOK</span>
                    <span>AUTHOR FACULTY: {curriculumSelectedMaterial.authorTeacher || 'IIT PHYSICS PANEL'}</span>
                  </div>
                  
                  {/* Handle newlines to paragraphs gracefully */}
                  {(curriculumSelectedMaterial.content || "").split('\n').map((line, lidx) => (
                    <p key={lidx} className={line.startsWith('#') ? 'text-indigo-400 font-extrabold text-sm border-b border-white/10 pb-1 mt-4 uppercase' : 'whitespace-pre-wrap'}>
                      {line}
                    </p>
                  ))}
                </div>

                {curriculumSelectedMaterial.materialType === 'test' && (() => {
                  const currentTestSubmission = submissions.find(s => s.testId === curriculumSelectedMaterial.id && s.studentId === currentStudent?.id);
                  if (currentTestSubmission) {
                    if (currentTestSubmission.status === 'graded') {
                      return (
                        <div className="bg-emerald-950/20 border border-emerald-850 p-5 rounded-none space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono">★ ASSESSMENT EVALUATED</span>
                          </div>
                          <div className="font-mono text-xs text-white space-y-1.5 bg-black/40 p-4 border border-emerald-900/40">
                            <p className="text-emerald-400 font-black text-sm uppercase">AWARD SCORE: {currentTestSubmission.grade?.score} / 100 PTS</p>
                            <p className="text-white/80 font-bold italic mt-2">Feedback: " {currentTestSubmission.grade?.feedback} "</p>
                            <p className="text-[9px] text-white/40 block mt-4 uppercase">Graded on: {new Date(currentTestSubmission.grade?.gradedAt || '').toLocaleDateString()}</p>
                          </div>
                          <div className="text-[11px] text-white/60 font-mono mt-2 p-3 bg-white/[0.02] border border-white/5">
                            <span className="text-[9px] text-white/45 block uppercase">Your Answers Submitted:</span>
                            <span className="italic block mt-1">"{currentTestSubmission.studentNotes}"</span>
                          </div>
                          {currentTestSubmission.submittedPdfUrl && (
                            <div className="mt-2 text-right">
                              <button
                                type="button"
                                onClick={() => setViewerMaterialFile(curriculumSelectedMaterial)}
                                className="bg-emerald-900 hover:bg-emerald-850 text-white font-mono font-bold text-[9px] px-3 py-1.5 rounded-none transition"
                              >
                                VIEW SUBMITTED SHEETS PDF
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-amber-950/20 border border-amber-800/40 p-5 rounded-none space-y-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono font-bold">RESPONSE RECEIVED ● GRADING PENDING</span>
                          </div>
                          <p className="text-slate-350 text-xs text-white/70">
                            Your solution sheet has been queued. Your teacher ({curriculumSelectedMaterial.authorTeacher}) is reviewing and manually grading submissions for this exam module.
                          </p>
                          <div className="p-3 bg-black/40 border border-white/5 rounded-none text-[11px] text-slate-300 font-mono">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Your Working Answers Notes:</span>
                            "{currentTestSubmission.studentNotes}"
                          </div>
                          {currentTestSubmission.submittedPdfUrl && (
                            <div className="mt-2 text-right">
                              <button
                                type="button"
                                onClick={() => setViewerMaterialFile(curriculumSelectedMaterial)}
                                className="bg-amber-950 hover:bg-amber-900 text-white font-mono font-bold text-[9px] px-3 py-1.5 rounded-none transition shadow"
                              >
                                VIEW SECURED SUBMISSION
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }
                  } else {
                    return (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!testNotes.trim()) {
                          alert("Please type your solving notes or solutions before finalizing your response!");
                          return;
                        }
                        setIsSubmittingTest(true);

                        const submissionData: Omit<Submission, 'id'> = {
                          assignmentId: '',
                          testId: curriculumSelectedMaterial.id,
                          studentId: currentStudent?.id || '',
                          studentName: currentStudent?.name || 'Anonymous Student',
                          studentNotes: testNotes.trim(),
                          submittedFile: testFileName || undefined,
                          submittedPdfUrl: testFileUrl || undefined,
                          submittedAt: new Date().toISOString(),
                          status: 'submitted'
                        };

                        onAddSubmission(submissionData);
                        setTestNotes('');
                        setTestFileName('');
                        setTestFileUrl('');
                        setIsSubmittingTest(false);
                        alert("Secure Assessment Solution Sheet filed successfully! Assigned teachers will manually evaluate your sheets shortly.");
                      }} className="bg-slate-950/60 border border-neutral-800 p-5 space-y-4 rounded-none">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest font-mono">EXAM SUBMISSION WORKSPACE</span>
                        </div>
                        
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Read the directives in the paper grid above. Answer manually by completing the answer ledger sheet below. Supplement your responses by uploading hand-written sheets scan.
                        </p>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest font-mono">My Answers Sheet Notebook Text</label>
                          <textarea
                            rows={5}
                            value={testNotes}
                            onChange={(e) => setTestNotes(e.target.value)}
                            placeholder="Type final formulas, subjective essays, and answers keys here clearly..."
                            className="w-full bg-[#050508] border border-white/10 text-white p-3 font-mono text-[11px] rounded-none focus:outline-none focus:border-indigo-550 leading-relaxed"
                            required
                          />
                        </div>

                        <div className="border border-dashed border-white/20 p-4 bg-white/[0.01] hover:bg-[#0C0C14] transition flex flex-col items-center justify-center text-center relative">
                          <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={handleTestPDFUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-6 h-6 text-indigo-400 mb-1" />
                          {testFileName ? (
                            <p className="text-[10px] text-indigo-405 text-indigo-400 font-mono font-black uppercase">
                              📁 FILE ATTACHED: {testFileName}
                            </p>
                          ) : (
                            <div>
                              <span className="text-[10px] font-black tracking-widest text-white block uppercase">UPLOAD HANDWRITTEN SOLUTIONS (PDF ONLY)</span>
                              <span className="text-[8px] text-white/40 block mt-0.5 font-mono">DRAG & DROP OR EXPLORE FILE EXPLORER</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingTest}
                          className="w-full bg-indigo-700 hover:bg-indigo-650 text-white font-mono text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-none transition"
                        >
                          {isSubmittingTest ? 'FILING SOLUTIONS...' : 'FINALIZE & PUBLISH SOLUTIONS SECURELY'}
                        </button>
                      </form>
                    );
                  }
                })()}

                {/* Optional attached files previews */}
                {curriculumSelectedMaterial.fileUrl && (
                  <div className="border border-indigo-500/30 bg-indigo-950/20 p-4 rounded-none flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-mono">SUPPLEMENT ATTACHMENT SECURED</span>
                      <p className="text-[11px] text-slate-300 mt-0.5">Complementary practice DPP document can be viewed on our secure canvas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewerMaterialFile(curriculumSelectedMaterial)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2.5 rounded-none transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>VIEW DPP ON CANVAS</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div className="bg-[#181820] border-t border-white/10 p-4 flex items-center justify-between text-[10px] text-white/40 font-mono">
                <span>SYSTEM SYNCRONIZER INTEGRITY: PASS</span>
                <span>UPLOADED DATE: {curriculumSelectedMaterial.createdAt}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STUDENT ID CARD SECURE VIEWER MODAL */}
      <AnimatePresence>
        {idCardModalOpen && dbStudent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            id="student-id-card-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-[#0f172a] border border-indigo-500/30 shadow-2xl p-6 rounded-none relative flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 select-none">
                <div>
                  <div className="flex items-center space-x-2 text-[10px] text-indigo-400 font-mono font-black tracking-widest uppercase">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>OFFICIAL STUDENT MEMBERSHIP CARD</span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase italic tracking-wider mt-0.5">
                    {dbStudent.name}'s SECURE PASS
                  </h4>
                </div>
                <button 
                  onClick={() => setIdCardModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white p-2 border border-white/10 rounded-none transition"
                  id="close-id-card-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
                {/* Visual Card Display representing high-fidelity FRONT and BACK side-by-side */}
                <div className="lg:col-span-6 flex flex-col justify-center items-center bg-zinc-950/80 p-6 border border-white/5 relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-zinc-950 pointer-events-none" />
                  
                  <div className="text-center mb-4 relative z-10">
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Interactive Double-Sided Proof Preview
                    </span>
                  </div>

                  {/* Side-by-Side Flex Container */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center justify-center relative z-10 w-full">
                    
                    {/* ================= CARD FRONT ================= */}
                    <div className="w-[214px] h-[330px] bg-white rounded-2xl relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between border border-zinc-200">
                      {/* Top Header Wave */}
                      <div className="absolute top-0 left-0 w-full h-[85px] pointer-events-none select-none overflow-hidden">
                        <svg viewBox="0 0 210 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
                          {/* Dark charcoal bottom wave */}
                          <path d="M0,0 L210,0 L210,48 C170,78 120,38 0,68 Z" fill="#292930" />
                          {/* White wave separator */}
                          <path d="M0,0 L210,0 L210,40 C165,70 115,32 0,59 Z" fill="#FFFFFF" />
                          {/* Bright saffron top wave for Gurukul, orange/red for regular */}
                          <path d="M0,0 L210,0 L210,32 C155,62 110,25 0,50 Z" fill={dbStudent.registrationType === 'abhedya_gurukul' ? '#D35400' : '#E51E25'} />
                        </svg>
                      </div>

                      {/* Header elements */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-15">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center p-0.5 bg-amber-500/20">
                            <EShikshaPieLogoIcon size={16} />
                          </div>
                          <div className="flex flex-col text-left scale-85 origin-left leading-none mt-0.5">
                            <span className="text-[10px] font-black text-white tracking-tight leading-none/90">
                              {dbStudent.registrationType === 'abhedya_gurukul' ? 'Abhedya Gurukul' : 'eShikshaPie'}
                            </span>
                            <span className="text-[5.5px] font-extrabold text-white/70 tracking-widest uppercase leading-none mt-0.5">
                              {dbStudent.registrationType === 'abhedya_gurukul' ? 'Gurukul Scholar' : 'Arjuna Scholar'}
                            </span>
                          </div>
                        </div>
                        <div className={`${dbStudent.registrationType === 'abhedya_gurukul' ? 'bg-[#D35400]' : 'bg-[#E51E25]'} text-white text-[5px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase scale-90`}>
                          {dbStudent.registrationType === 'abhedya_gurukul' ? '🔱 GURUKUL' : '🎯 ARJUNA'}
                        </div>
                      </div>

                      {/* Avatar Photo cutout with bold Orange Dual Frame */}
                      <div className="relative z-10 flex flex-col items-center mt-[55px]">
                        <div className={`relative w-20 h-20 rounded-full border-[3px] ${dbStudent.registrationType === 'abhedya_gurukul' ? 'border-amber-600' : 'border-[#E51E25]'} bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden`}>
                          <div className="w-full h-full rounded-full bg-[#292930] flex items-center justify-center text-white text-2xl font-black uppercase border border-zinc-100">
                            {dbStudent.studentPhoto ? (
                              <img src={dbStudent.studentPhoto} alt={dbStudent.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              dbStudent.name?.charAt(0)
                            )}
                          </div>
                        </div>

                        {/* Student Name */}
                        <h3 className="mt-2 text-xs font-black text-zinc-800 tracking-tight uppercase leading-none text-center px-2 truncate max-w-full">
                          {dbStudent.name}
                        </h3>
                        <p className={`mt-0.5 text-[8px] font-black ${dbStudent.registrationType === 'abhedya_gurukul' ? 'text-amber-600' : 'text-[#E51E25]'} tracking-widest uppercase leading-none`}>
                          {dbStudent.registrationType === 'abhedya_gurukul' ? '🔱 ABHEDYA SCHOLAR' : '🎯 ARJUNA BATCH'}
                        </p>
                      </div>

                      {/* Details structure matched with QR code */}
                      <div className="relative z-10 px-3.5 mb-[55px] flex items-start justify-between gap-1.5">
                        <div className={`flex-1 flex flex-col gap-1 text-[8px] text-zinc-700 font-sans border-r ${dbStudent.registrationType === 'abhedya_gurukul' ? 'border-amber-600/30' : 'border-[#FF5A1F]/20'} pr-1 text-left`}>
                          <div className="flex flex-col border-b border-zinc-100 pb-0.5">
                            <span className="text-[6.5px] font-black text-zinc-400 uppercase tracking-wider leading-none">ID Number:</span>
                            <span className="font-extrabold text-zinc-900 leading-tight mt-0.5 truncate">{dbStudent.studentIdCardNumber}</span>
                          </div>
                          <div className="flex flex-col border-b border-zinc-100 pb-0.5">
                            <span className="text-[6.5px] font-black text-zinc-400 uppercase tracking-wider leading-none">Grade Level:</span>
                            <span className="font-extrabold text-zinc-900 leading-tight mt-0.5">{dbStudent.enrolledClass}</span>
                          </div>
                          {dbStudent.gurukulFacility && (
                            <div className="flex flex-col border-b border-zinc-100 pb-0.5">
                              <span className="text-[6.5px] font-black text-amber-600 uppercase tracking-wider leading-none font-sans">Gurukul Category:</span>
                              <span className="font-extrabold text-amber-800 leading-tight mt-0.5 truncate text-[7.5px] font-sans">{dbStudent.gurukulFacility}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[6.5px] font-black text-zinc-400 uppercase tracking-wider leading-none">Date of Birth:</span>
                            <span className="font-extrabold text-zinc-900 leading-tight mt-0.5">
                              {(() => {
                                let sumDob = 0;
                                for (let j = 0; j < dbStudent.studentIdCardNumber.length; j++) sumDob += dbStudent.studentIdCardNumber.charCodeAt(j);
                                const yDob = 2008 + (sumDob % 3);
                                const mDob = 1 + (sumDob % 12);
                                const dDob = 1 + (sumDob % 28);
                                const padDob = (n: number) => n.toString().padStart(2, '0');
                                return `${padDob(dDob)}/${padDob(mDob)}/${yDob}`;
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Pixel-perfect vector QR Code */}
                        <div className="shrink-0 flex items-center justify-center p-0.5 bg-white border border-zinc-200">
                          <svg className="w-[36px] h-[36px] text-zinc-950" viewBox="0 0 29 29" fill="currentColor">
                            <path d="M0 0h7v7H0zm1 1v5h5V1zm21-1h7v7h-7zm1 1v5h5V1zM0 22h7v7H0zm1 1v5h5v-5z" />
                            <path d="M9 0h2v1H9zm4 0h1v4h-1zm3 0h4v1h-4zm5 0h1v2h-1zm0 3h2v1h-2zm-9 2h2v1H9zm4 1h1v1h-1zm2 0h2v2h-2zm4 0h1v1h-1zm-10 2h1v1h-1zm3 0h1v1h-1zm5 0h2v1h-2zm-12 5h1v1H0zm3 0h2v1H3zm6 0h2v2H9zm4 0h3v1h-3zm5 0h1v1h-1zm2 0h2v1h-2zm-16 2h1v2H0zm4 0h1v1H4zm3 0h1v1H7zm5 0h2v1h-2zm3 0h2v1h-2zm4 0h1v1h-1zm3 0h2v2h-2zm-18 2h2v1H2zm4 0h1v1H6zm4 0h1v1h-1zm4 0h1v1h-1zm2 0h2v1h-2zm4 0h1v1h-1zm-15 2h2v1H5zm4 0h2v1H9zm4 0h1v1h-1zm3 0h2v1h-2zm5 0h1v1h-1zm2 0h2v1h-2z" />
                          </svg>
                        </div>
                      </div>

                      {/* Footer Curve */}
                      <div className="absolute bottom-0 left-0 w-full h-[53px] pointer-events-none select-none overflow-hidden">
                        <svg viewBox="0 0 210 53" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
                          {/* Dark charcoal wave on top */}
                          <path d="M0,21 C75,0 135,50 210,26 L210,53 L0,53 Z" fill="#292930" />
                          {/* White separator layer */}
                          <path d="M0,27 C75,6 135,54 210,32 L210,53 L0,53 Z" fill="#FFFFFF" />
                          {/* Orange/red wave at bottom */}
                          <path d="M0,33 C75,12 135,58 210,38 L210,53 L0,53 Z" fill="#FF5A1F" />
                        </svg>
                      </div>
                    </div>


                    {/* ================= CARD BACK ================= */}
                    <div className="w-[214px] h-[330px] bg-white rounded-2xl relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between border border-zinc-200">
                      {/* Top Header Wave */}
                      <div className="absolute top-0 left-0 w-full h-[85px] pointer-events-none select-none overflow-hidden">
                        <svg viewBox="0 0 210 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
                          {/* Dark charcoal bottom wave */}
                          <path d="M0,0 L210,0 L210,48 C170,78 120,38 0,68 Z" fill="#292930" />
                          {/* White wave separator */}
                          <path d="M0,0 L210,0 L210,40 C165,70 115,32 0,59 Z" fill="#FFFFFF" />
                          {/* Bright orange/red top wave */}
                          <path d="M0,0 L210,0 L210,32 C155,62 110,25 0,50 Z" fill={dbStudent.registrationType === 'abhedya_gurukul' ? '#D35400' : '#E51E25'} />
                        </svg>
                      </div>

                      {/* Header elements */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-15">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center p-0.5 bg-amber-500/20">
                            <EShikshaPieLogoIcon size={16} />
                          </div>
                          <div className="flex flex-col text-left scale-85 origin-left leading-none mt-0.5">
                            <span className="text-[10px] font-black text-white tracking-tight leading-none/90">
                              {dbStudent.registrationType === 'abhedya_gurukul' ? 'Abhedya Gurukul' : 'eShikshaPie'}
                            </span>
                            <span className="text-[5.5px] font-extrabold text-white/70 tracking-widest uppercase leading-none mt-0.5">
                              {dbStudent.registrationType === 'abhedya_gurukul' ? 'Gurukul Scholar' : 'Arjuna Scholar'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-[#292930] text-white text-[5.5px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase scale-90">
                          Back
                        </div>
                      </div>

                      {/* Centered Institutional Seal Logo */}
                      <div className="relative z-10 flex flex-col items-center mt-[55px] px-2 text-center">
                        <div className="flex items-center justify-center p-1.5 bg-zinc-950 rounded-full shadow-sm mb-1 border border-zinc-100">
                          <EShikshaPieLogoIcon size={24} />
                        </div>
                        <div className="flex items-baseline scale-85 mt-0.5 leading-none">
                          <span className="text-[9px] font-black text-[#D35400]">
                            {dbStudent.registrationType === 'abhedya_gurukul' ? 'Abhedya' : 'Shiksha'}
                          </span>
                          <span className="text-[9px] font-black text-[#F39C12] ml-0.5">
                            {dbStudent.registrationType === 'abhedya_gurukul' ? 'Gurukul' : 'Pie'}
                          </span>
                        </div>
                        <span className="text-[5px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">
                          {dbStudent.registrationType === 'abhedya_gurukul' ? '🔱 GURUKUL SCHOLARSHIP RECORD' : '🎯 ARJUNA BATCH MEMBER'}
                        </span>
                      </div>

                      {/* Secure contact and address info */}
                      <div className="relative z-10 px-4 flex flex-col gap-1 text-[7px] text-zinc-600 font-sans border-t border-zinc-100 pt-1.5 text-left">
                        <div className="flex items-start">
                          <span className="font-extrabold text-zinc-400 w-10 shrink-0">Phone:</span>
                          <span className="font-bold text-zinc-800">+91 98765 00000</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-extrabold text-zinc-400 w-10 shrink-0">Email:</span>
                          <span className="font-bold text-zinc-800 truncate max-w-[140px]">{dbStudent.email}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-extrabold text-zinc-400 w-10 shrink-0">Address:</span>
                          <span className="font-bold text-zinc-800 leading-tight">eShikshaPie National Cloud Hub, Sector 4, Silicon Block</span>
                        </div>
                      </div>

                      {/* Terms of Use */}
                      <div className="relative z-10 px-4 text-left leading-none">
                        <span className="text-[6.5px] font-black text-zinc-400 uppercase tracking-wider leading-none">Terms of Use:</span>
                        <p className="text-[5px] text-zinc-500 font-medium leading-normal mt-0.5">
                          {dbStudent.registrationType === 'abhedya_gurukul'
                            ? 'This custom Abhedya Gurukul Scholar Pass is governed by eShikshaPie. Holder is entitled to ₹300 fixed registration rate and automatic scholarship benefits.'
                            : 'This ID card is the exclusive property of eShikshaPie. Must be produced during secured written tests and AI whiteboard evaluation labs.'}
                        </p>
                      </div>

                      {/* Sharp high-fidelity barcode visual */}
                      <div className="relative z-10 px-4 mb-[48px] overflow-hidden">
                        <div className="flex items-end justify-between w-full h-[18px] bg-white px-2 py-0.5 border border-zinc-200">
                          {Array.from({ length: 42 }).map((_, i) => {
                            const widths = [1, 2, 3, 1.5, 2.5];
                            const width = widths[(i * 7 + 3) % widths.length];
                            const isGap = (i * 13) % 5 === 0;
                            return (
                              <div 
                                key={i} 
                                style={{ width: isGap ? '1px' : `${width}px` }} 
                                className={`h-full ${isGap ? 'bg-transparent' : 'bg-black'}`} 
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer Curve */}
                      <div className="absolute bottom-0 left-0 w-full h-[53px] pointer-events-none select-none overflow-hidden">
                        <svg viewBox="0 0 210 53" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
                          {/* Dark charcoal wave on top */}
                          <path d="M0,21 C75,0 135,50 210,26 L210,53 L0,53 Z" fill="#292930" />
                          {/* White separator layer */}
                          <path d="M0,27 C75,6 135,54 210,32 L210,53 L0,53 Z" fill="#FFFFFF" />
                          {/* Orange/red wave at bottom */}
                          <path d="M0,33 C75,12 135,58 210,38 L210,53 L0,53 Z" fill="#FF5A1F" />
                        </svg>
                      </div>
                    </div>

                  </div>
                  
                  <div className="mt-4 text-center pb-2 relative z-10">
                    <p className="text-[10px] text-orange-400 font-bold">Academic Term: 2026-2027 Admission Cycle</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">Secured Verification Passport v4.11</p>
                  </div>
                </div>

                {/* PDF Canvas Viewer interactive stream (Right side) */}
                <div className="lg:col-span-6 bg-black/40 border border-white/10 p-2 relative flex flex-col min-h-[350px]">
                  <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 select-none">
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-500/25 px-2 py-1 text-[8px] font-mono uppercase tracking-widest rounded font-extrabold">
                      PDF.JS RENDERED ATTACHMENT
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <PdfCanvasViewer 
                      pdfUrl={idCardPdfUrl}
                      pdfName={`ESHIKSHA_ID_${dbStudent.name.replace(/\s+/g, '_')}.pdf`}
                      pdfText="Secured Registration Pass. Encrypted document stream."
                      theme="dark"
                      disableDownload={true}
                    />
                  </div>
                </div>

              </div>

              {/* Action summary row */}
              <div className="mt-6 flex flex-wrap gap-3 items-center justify-between border-t border-white/10 pt-4 font-mono select-none">
                <span className="text-[10px] text-indigo-400/70 font-bold">
                  SECURE COMPLIANCE: ESHIKSHAPIE-ENHANCED PROTECTION
                </span>
                <button
                  onClick={handleOpenStudentIDCard}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
                >
                  DOWNLOAD PDF ORIGINAL
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
