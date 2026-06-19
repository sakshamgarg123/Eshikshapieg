/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Plus, Play, Calendar, FileText, UploadCloud, Cpu, CheckCircle, 
  TrendingUp, Award, Clock, Eye, AlertCircle, LogOut, ChevronRight, BarChart2,
  Users, User, Trophy, ShieldCheck, UserCheck, X, Lock, ShieldAlert, EyeOff,
  Video, Trash2, GraduationCap, HelpCircle, Download
} from 'lucide-react';
import { 
  Subject, ClassGrade, Quiz, Assignment, Submission, 
  Student, QuizAttempt, LiveClass, Teacher, ChapterMaterial, CountdownTimerConfig,
  DoubtSessionReminder, StudentDoubtSubmission
} from '../types';
import PdfCanvasViewer from './PdfCanvasViewer';
import { jsPDF } from 'jspdf';
import { exportTicketToPDF } from '../utils/pdfExport';

interface TeacherDashboardViewProps {
  students: Student[];
  assignments: Assignment[];
  quizzes: Quiz[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  liveClasses: LiveClass[];
  onAddLiveClass: (newClass: Omit<LiveClass, 'id'>) => void;
  onAddAssignment: (newAssignment: Omit<Assignment, 'id'>) => void;
  onAddQuiz: (newQuiz: Quiz) => void;
  onGradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  onToggleLive: (classId: string) => void;
  onUpdateLiveClass: (classId: string, updatedFields: Partial<LiveClass>) => void;
  onDeleteLiveClass: (classId: string) => void;
  onTriggerClassSession: (session: LiveClass) => void;
  onAddStudent: (newStudent: Student) => void;
  onDeleteQuiz?: (quizId: string) => void;
  teachers: Teacher[];
  onSetTeachers: (teachers: Teacher[]) => void;
  chapterMaterials: ChapterMaterial[];
  onSetChapterMaterials: (materials: ChapterMaterial[]) => void;
  countdownConfig?: CountdownTimerConfig;
  onSetCountdownConfig?: (config: CountdownTimerConfig) => void;
  doubtReminders: DoubtSessionReminder[];
  onSetDoubtReminders: React.Dispatch<React.SetStateAction<DoubtSessionReminder[]>>;
  doubtSubmissions: StudentDoubtSubmission[];
  onSetDoubtSubmissions: React.Dispatch<React.SetStateAction<StudentDoubtSubmission[]>>;
}

function getPdfViewerUrl(id: string): string {
  const origin = window.location.origin;
  const absoluteUrl = `${origin}/api/pdf/view/${id}`;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return absoluteUrl;
  }
  return `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
}

export default function TeacherDashboardView({
  students,
  assignments,
  quizzes,
  submissions,
  quizAttempts,
  liveClasses,
  onAddLiveClass,
  onAddAssignment,
  onAddQuiz,
  onGradeSubmission,
  onToggleLive,
  onUpdateLiveClass,
  onDeleteLiveClass,
  onTriggerClassSession,
  onAddStudent,
  onDeleteQuiz,
  teachers,
  onSetTeachers,
  chapterMaterials,
  onSetChapterMaterials,
  countdownConfig,
  onSetCountdownConfig,
  doubtReminders,
  onSetDoubtReminders,
  doubtSubmissions,
  onSetDoubtSubmissions
}: TeacherDashboardViewProps) {
  // Session details
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [subjectInput, setSubjectInput] = useState<Subject>('Physics');
  const [credentialInput, setCredentialInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [authMode, setAuthMode] = useState<'login'>('login');

  // Tab switcher
  const [activeTab, setActiveTab] = useState<'live' | 'assignments' | 'quizzes' | 'grading' | 'students' | 'leaderboard' | 'materials' | 'tests' | 'certificates' | 'doubts'>('live');

  // Doubt Class Form fields (Teacher)
  const [doubtFormTitle, setDoubtFormTitle] = useState('');
  const [doubtFormSubject, setDoubtFormSubject] = useState<Subject>('Physics');
  const [doubtFormClass, setDoubtFormClass] = useState<ClassGrade | 'All Classes'>('All Classes');
  const [doubtFormDays, setDoubtFormDays] = useState<('Saturday' | 'Sunday' | 'Special Holiday')[]>(['Saturday']);
  const [doubtHolidayName, setDoubtHolidayName] = useState('');
  const [doubtFormAddress, setDoubtFormAddress] = useState('');
  const [doubtFormDesc, setDoubtFormDesc] = useState('');

  // Doubt submission moderation active target states
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [teacherCustomLoc, setTeacherCustomLoc] = useState('');
  const [teacherAdviceNotes, setTeacherAdviceNotes] = useState('');

  // Zoomed picture modal helper state
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  // Interactive Create States
  const [createLiveOpen, setCreateLiveOpen] = useState(false);
  const [createAssignOpen, setCreateAssignOpen] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);

  // Form Fields - Live Class
  const [liveTitle, setLiveTitle] = useState('');
  const [liveClassTarget, setLiveClassTarget] = useState<ClassGrade>('IIT-JEE');
  const [liveClassDate, setLiveClassDate] = useState('');
  const [liveMeetLink, setLiveMeetLink] = useState('');
  const [editingMeetLinkId, setEditingMeetLinkId] = useState<string | null>(null);
  const [editingMeetLinkUrl, setEditingMeetLinkUrl] = useState('');

  useEffect(() => {
    if (createLiveOpen && !liveMeetLink) {
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      const r = (len: number) => Array.from({length: len}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      setLiveMeetLink(`https://meet.google.com/${r(3)}-${r(4)}-${r(3)}`);
    }
  }, [createLiveOpen, liveMeetLink]);

  // Form Fields - Assignment
  const [assignTitle, setAssignTitle] = useState('');
  const [assignClass, setAssignClass] = useState<ClassGrade>('IIT-JEE');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignPoints, setAssignPoints] = useState(100);
  const [assignDesc, setAssignDesc] = useState('');
  const [uploadedPDFName, setUploadedPDFName] = useState('');
  const [uploadedPDFUrl, setUploadedPDFUrl] = useState('');
  const [extractedPDFText, setExtractedPDFText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields - AI Quiz generator
  const [quizPrompt, setQuizPrompt] = useState('');
  const [quizSourceText, setQuizSourceText] = useState('');
  const [quizClassTarget, setQuizClassTarget] = useState<ClassGrade>('IIT-JEE');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizPDFName, setQuizPDFName] = useState('');
  const [quizPDFUrl, setQuizPDFUrl] = useState('');
  const [isUploadingQuizPDF, setIsUploadingQuizPDF] = useState(false);
  const [quizDeadline, setQuizDeadline] = useState('');
  const [quizAutoDelete, setQuizAutoDelete] = useState(false);

  // Grading UI States
  const [isGradingId, setIsGradingId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(0);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  const [gradingSelectedSub, setGradingSelectedSub] = useState<Submission | null>(null);

  // View individual student drill-down report card
  const [selectedDrillDownStudent, setSelectedDrillDownStudent] = useState<Student | null>(null);

  // States for Chapter Materials Uploader
  const [mSubject, setMSubject] = useState<Subject>('Mathematics');
  const [mTargetClass, setMTargetClass] = useState<ClassGrade>('Class 12');
  const [mChapterId, setMChapterId] = useState('CH-1');
  const [mChapterName, setMChapterName] = useState('Relations and Functions');
  const [mType, setMType] = useState<'booklet' | 'video' | 'test' | 'ncert' | 'question_bank' | 'revision_notes' | 'mlc'>('booklet');
  const [mSubType, setMSubType] = useState<'theory' | 'examples' | 'pyq' | 'practice' | 'dpp'>('theory');
  const [mTestSubType, setMTestSubType] = useState<'part_test' | 'half_syllabus_test' | 'full_syllabus_test' | 'weekly_test' | 'chapter_test' | 'half_yearly_test' | 'yearly_test'>('part_test');
  const [mTitle, setMTitle] = useState('');
  const [mContent, setMContent] = useState('');
  const [mVideoUrl, setMVideoUrl] = useState('');
  const [mFileName, setMFileName] = useState('');
  const [mFileUrl, setMFileUrl] = useState('');
  const [mSuccess, setMSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // States for Secure Tests Manager
  const [managingTestId, setManagingTestId] = useState<string | null>(null);
  const [testGradeScores, setTestGradeScores] = useState<{[subId: string]: number}>({});
  const [testGradeFeedbacks, setTestGradeFeedbacks] = useState<{[subId: string]: string}>({});
  const [testUploadSuccess, setTestUploadSuccess] = useState('');

  // States for active countdown config editing & publication
  const [cdTitle, setCdTitle] = useState(countdownConfig?.title || 'Physics Board Prep: Master Satellite Arrays Session');
  const [cdDateTime, setCdDateTime] = useState(countdownConfig?.targetDateTime || '2026-06-25T14:30');
  const [cdType, setCdType] = useState<'live_class' | 'assignment' | 'custom'>(countdownConfig?.type || 'live_class');
  const [cdActive, setCdActive] = useState(countdownConfig?.isActive ?? true);
  const [cdSuccess, setCdSuccess] = useState(false);

  // Manual Certificate Generator States
  const [certTitle, setCertTitle] = useState('Certificate of Achievement');
  const [certSubtitle, setCertSubtitle] = useState('THE FOLLOWING AWARD IS GIVEN TO');
  const [certRecipientName, setCertRecipientName] = useState('Marceline Anderson');
  const [certDescription, setCertDescription] = useState('For outstanding academic performance, exemplary character, and unparalleled commitment to educational excellence in the honors program of senior study.');
  const [certLeftSignerTitle, setCertLeftSignerTitle] = useState('Head of Event');
  const [certLeftSignerName, setCertLeftSignerName] = useState('Dr. Arshdeep Singh');
  const [certRightSignerTitle, setCertRightSignerTitle] = useState('Mentor');
  const [certRightSignerName, setCertRightSignerName] = useState('Prof. Anita Sen');
  const [certDate, setCertDate] = useState('June 17, 2026');
  const [certBorderColor, setCertBorderColor] = useState('#3E4B57'); // Matching the original screenshot slate tone
  const [certHasTexture, setCertHasTexture] = useState(true);
  const [certBadgeStyle, setCertBadgeStyle] = useState<'classic-scalloped' | 'starburst' | 'crest'>('classic-scalloped');

  useEffect(() => {
    if (countdownConfig) {
      setCdTitle(countdownConfig.title);
      if (countdownConfig.targetDateTime) {
        try {
          const dt = new Date(countdownConfig.targetDateTime);
          const tzOffset = dt.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(dt.getTime() - tzOffset)).toISOString().slice(0, 16);
          setCdDateTime(localISOTime);
        } catch (e) {
          setCdDateTime(countdownConfig.targetDateTime.slice(0, 16));
        }
      }
      setCdType(countdownConfig.type);
      setCdActive(countdownConfig.isActive);
    }
  }, [countdownConfig]);

  // Certificate Generator canvas painter
  const drawCertificate = () => {
    const canvas = document.getElementById('certificate_live_canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1600;
    const height = 1131;
    canvas.width = width;
    canvas.height = height;

    // 1. Clear background & draw cream/parchment color
    ctx.fillStyle = '#F4F2EE'; // Elegant parchment off-white/beige
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Subtle Parchment Texture (Faint Marble vein or small speckles if turned on)
    if (certHasTexture) {
      // Small randomized speckles / dust dots
      ctx.fillStyle = 'rgba(120, 100, 80, 0.05)';
      for (let i = 0; i < 450; i++) {
        const x = (Math.sin(i * 9831) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 3241) * 0.5 + 0.5) * height;
        const r = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Large soft aged clouds
      ctx.strokeStyle = 'rgba(139, 115, 85, 0.025)';
      for (let i = 0; i < 8; i++) {
        const cx = (Math.sin(i * 1234) * 0.5 + 0.5) * width;
        const cy = (Math.cos(i * 5678) * 0.5 + 0.5) * height;
        const radius = Math.random() * 250 + 100;
        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 3. Draw Dual Frame Borders (Ornate Vintage Style)
    ctx.strokeStyle = certBorderColor;
    
    // Outer Frame
    const oInset = 45;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(oInset, oInset, width - oInset * 2, height - oInset * 2);

    // Inner Frame
    const iInset = oInset + 12;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(iInset, iInset, width - iInset * 2, height - iInset * 2);

    // Faint decorative inner frame
    const mInset = oInset + 18;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(62, 75, 87, 0.25)';
    ctx.strokeRect(mInset, mInset, width - mInset * 2, height - mInset * 2);

    ctx.strokeStyle = certBorderColor; // Restore border color

    // 4. Draw Ornate Baroque Corner Flourishes (Classic vintage curls)
    const drawCornerOrnament = (cx: number, cy: number, rotX: 1 | -1, rotY: 1 | -1) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rotX, rotY);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = certBorderColor;
      ctx.fillStyle = certBorderColor;

      // Draw elegant corner leaf curl
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, -5, 30, 15);
      ctx.quadraticCurveTo(25, 30, 10, 20);
      ctx.quadraticCurveTo(5, 10, 0, 0);
      ctx.fill();

      // Hairline decorative scrolls extending out
      ctx.beginPath();
      ctx.arc(35, 35, 15, Math.PI * 1.5, Math.PI, true);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(40, 10, 10, 70, 60, 60);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(10, 40, 70, 10, 60, 60);
      ctx.stroke();

      // Little leaf details along inner frame borders
      ctx.beginPath();
      ctx.arc(80, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 80, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw ornaments in all 4 corners of the inner frame (iInset)
    drawCornerOrnament(iInset + 5, iInset + 5, 1, 1);       // Top-Left
    drawCornerOrnament(width - iInset - 5, iInset + 5, -1, 1);    // Top-Right
    drawCornerOrnament(iInset + 5, height - iInset - 5, 1, -1);   // Bottom-Left
    drawCornerOrnament(width - iInset - 5, height - iInset - 5, -1, -1); // Bottom-Right

    // Draw little header & footer flourishes
    const drawDividerFlourish = (y: number) => {
      ctx.save();
      ctx.translate(width / 2, y);
      ctx.strokeStyle = certBorderColor;
      ctx.fillStyle = certBorderColor;
      ctx.lineWidth = 1;

      // Draw central diamond
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();

      // Extend ornate horizontal lines left & right with small dots
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.lineTo(-15, 0);
      ctx.moveTo(15, 0);
      ctx.lineTo(160, 0);
      ctx.stroke();

      // Curly scroll wings
      ctx.beginPath();
      ctx.arc(-80, -4, 8, 0, Math.PI, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(80, -4, 8, 0, Math.PI, false);
      ctx.stroke();

      // Side terminal dots
      ctx.beginPath();
      ctx.arc(-165, 0, 3, 0, Math.PI * 2);
      ctx.arc(165, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 5. Draw Header Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1C262F'; // Ink dark gray

    // Title Font
    ctx.font = "normal 68px Cinzel, 'Playfair Display', Georgia, serif";
    ctx.fillText(certTitle, width / 2, 230);

    // Decorative separator flourish underneath Title
    drawDividerFlourish(295);

    // 6. Draw Subtitle
    ctx.fillStyle = 'rgba(28, 38, 47, 0.7)';
    ctx.font = "bold 15px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText(certSubtitle, width / 2, 345);
    ctx.letterSpacing = "normal"; // reset letter spacing

    // 7. Draw Recipient's Name
    ctx.fillStyle = '#222B35';
    ctx.font = "normal 80px 'Great Vibes', 'Brush Script MT', cursive";
    ctx.fillText(certRecipientName, width / 2, 455);

    // Draw the subtle dashed/dotted underline underneath the name
    ctx.strokeStyle = 'rgba(62, 75, 87, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 520);
    ctx.lineTo(width / 2 + 250, 520);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // 8. Draw Main Citation/Description (Can support multi-line wrap!)
    ctx.fillStyle = 'rgba(40, 50, 60, 0.85)';
    ctx.font = "normal italic 21px 'Playfair Display', Georgia, serif";
    
    // Auto-wrap description helper
    const words = certDescription.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxLineWidth = 825;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Draw lines
    const startY = 575;
    const lineHeight = 33;
    lines.forEach((lineText, idx) => {
      ctx.fillText(lineText, width / 2, startY + idx * lineHeight);
    });

    // 9. Draw Elegant Scalloped Badge Seal at bottom center!
    const drawSeal = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      const numPoints = 48;
      const oRad = 58;
      const iRad = 52;

      ctx.fillStyle = certBorderColor; // Use selected border color for the seal
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i * Math.PI) / numPoints;
        const rad = i % 2 === 0 ? oRad : iRad;
        const px = Math.cos(angle) * rad;
        const py = Math.sin(angle) * rad;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner goldish/paper-faint line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.stroke();

      // Text inside the seal
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("CERTIFIED", 0, -4);
      ctx.fillText("EXCELLENCE", 0, 8);

      ctx.restore();
    };

    drawSeal(width / 2, height - 190);

    // 10. Draw Left and Right Signatures & Titles
    const sigLineY = height - 210;
    const sigLineWidth = 200;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(62, 75, 87, 0.4)';

    // LEFT SIGNER
    const leftSigX = width / 2 - 320;
    ctx.beginPath();
    ctx.moveTo(leftSigX - sigLineWidth / 2, sigLineY);
    ctx.lineTo(leftSigX + sigLineWidth / 2, sigLineY);
    ctx.stroke();

    // Signature
    ctx.fillStyle = 'rgba(28, 38, 47, 0.85)';
    ctx.font = "normal 35px 'Great Vibes', cursive";
    ctx.fillText(certLeftSignerName, leftSigX, sigLineY - 32);

    // Left Name & Title
    ctx.fillStyle = '#1C262F';
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(certLeftSignerName, leftSigX, sigLineY + 22);
    ctx.fillStyle = 'rgba(28, 38, 47, 0.65)';
    ctx.font = "normal 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(certLeftSignerTitle, leftSigX, sigLineY + 39);

    // RIGHT SIGNER
    const rightSigX = width / 2 + 320;
    ctx.beginPath();
    ctx.moveTo(rightSigX - sigLineWidth / 2, sigLineY);
    ctx.lineTo(rightSigX + sigLineWidth / 2, sigLineY);
    ctx.stroke();

    // Signature
    ctx.fillStyle = 'rgba(28, 38, 47, 0.85)';
    ctx.font = "normal 35px 'Great Vibes', cursive";
    ctx.fillText(certRightSignerName, rightSigX, sigLineY - 32);

    // Right Name & Title
    ctx.fillStyle = '#1C262F';
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(certRightSignerName, rightSigX, sigLineY + 22);
    ctx.fillStyle = 'rgba(28, 38, 47, 0.65)';
    ctx.font = "normal 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(certRightSignerTitle, rightSigX, sigLineY + 39);

    // 11. Add Issue Date & School Info
    ctx.fillStyle = 'rgba(28, 38, 47, 0.55)';
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`ISSUED DIGITAL RECORD: ${certDate.toUpperCase()}`, width / 2, height - 90);
  };

  const downloadCertificatePDF = () => {
    const canvas = document.getElementById('certificate_live_canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    pdf.save(`Certificate_${certRecipientName.replace(/\s+/g, '_')}.pdf`);
  };

  useEffect(() => {
    if (activeTab === 'certificates') {
      const timer = setTimeout(() => {
        drawCertificate();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [
    activeTab,
    certTitle,
    certSubtitle,
    certRecipientName,
    certDescription,
    certLeftSignerTitle,
    certLeftSignerName,
    certRightSignerTitle,
    certRightSignerName,
    certDate,
    certBorderColor,
    certHasTexture,
    certBadgeStyle
  ]);

  const handlePublishCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSetCountdownConfig) {
      onSetCountdownConfig({
        title: cdTitle,
        targetDateTime: cdDateTime,
        type: cdType,
        isActive: cdActive
      });
      setCdSuccess(true);
      setTimeout(() => setCdSuccess(false), 3000);
    }
  };

  const handleDeleteCountdown = () => {
    if (onSetCountdownConfig) {
      onSetCountdownConfig({
        title: '',
        targetDateTime: '',
        type: 'custom',
        isActive: false
      });
      setCdTitle('');
      setCdDateTime('');
      setCdActive(false);
      setCdSuccess(false);
    }
  };

  const generateReportCardPDF = async (std: Student) => {
    // 1. Create jsPDF document instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const studentSubmissions = submissions.filter(s => s.studentId === std.id);
    const gradedSubs = studentSubmissions.filter(s => s.status === 'graded');
    const avgGradePr = gradedSubs.length > 0 
      ? Math.round(gradedSubs.reduce((acc, current) => acc + (current.grade?.score || 0), 0) / gradedSubs.length)
      : 0;
    
    const studentAttempts = quizAttempts.filter(qa => qa.studentId === std.id);

    // Cover page & layout constants (A4 is 210 x 297 mm)
    // ----------------------------------------------------
    // Header Banner (Slate Navy Blue color theme)
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(10, 10, 190, 26, 'F');

    // School Badge Title Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('eSHIKSHAPIE ACADEMIC SYSTEM', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('AFFILIATED DIGITAL LEARNING PORTAL & AI CLASSROOM MATRIX', 15, 24);
    doc.text(`DATE OF INSPECTION: ${new Date().toLocaleDateString()}`, 142, 18);
    doc.text('EVALUATOR: ATM SIR', 142, 24);

    // Decorative Orange divider strip
    doc.setFillColor(249, 115, 22); // Orange 500
    doc.rect(10, 36, 190, 2, 'F');

    // Title Section
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('OFFICIAL ACADEMIC INSPECTION REPORT CARD', 10, 47);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(9.5);
    doc.text('Comprehensive evaluation transcript encompassing digital quiz metrics and graded written worksheets.', 10, 52);

    // Student Information Grid Box
    doc.setFillColor(248, 250, 252); // grey-50
    doc.setDrawColor(226, 232, 240); // grey-200
    doc.rect(10, 57, 190, 32, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('STUDENT PROFILE', 15, 63);
    doc.line(15, 65, 55, 65);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Full Name:`, 15, 71);
    doc.setFont('helvetica', 'bold');
    doc.text(`${std.name}`, 38, 71);

    doc.setFont('helvetica', 'normal');
    doc.text(`Portal Email:`, 15, 77);
    doc.setFont('helvetica', 'bold');
    doc.text(`${std.email}`, 38, 77);

    doc.setFont('helvetica', 'normal');
    doc.text(`Enrolled Class:`, 15, 83);
    doc.setFont('helvetica', 'bold');
    doc.text(`${std.enrolledClass}`, 38, 83);

    // Right Column in the profile box
    doc.setFont('helvetica', 'normal');
    doc.text(`System Security ID:`, 110, 71);
    doc.setFont('helvetica', 'bold');
    doc.text(`SECURE-${std.id.substring(0,6).toUpperCase()}`, 145, 71);

    doc.setFont('helvetica', 'normal');
    doc.text(`Secret Access Key:`, 110, 77);
    doc.setFont('helvetica', 'bold');
    doc.text(`${std.accessCode}`, 145, 77);

    doc.setFont('helvetica', 'normal');
    doc.text(`Academic Standing:`, 110, 83);
    doc.setFont('helvetica', 'bold');
    const standingLabel = avgGradePr >= 90 ? 'Outstanding (A+)' : avgGradePr >= 75 ? 'First Class Honor (A/B)' : avgGradePr >= 50 ? 'Satisfactory (C)' : 'Assessment Pending';
    doc.text(standingLabel, 145, 83);

    // Metric Badges Section
    doc.setFillColor(239, 246, 255); // blue-50
    doc.rect(10, 94, 58, 20, 'F');
    doc.setTextColor(29, 78, 216); // blue-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('QUIZZES COMPLETED', 13, 99);
    doc.setFontSize(12);
    doc.text(`${studentAttempts.length}`, 13, 108);

    doc.setFillColor(240, 253, 244); // green-50
    doc.rect(76, 94, 58, 20, 'F');
    doc.setTextColor(21, 128, 61); // green-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('WORKSHEETS GRADED', 79, 99);
    doc.setFontSize(12);
    doc.text(`${gradedSubs.length}`, 79, 108);

    doc.setFillColor(254, 242, 242); // red-50
    doc.rect(142, 94, 58, 20, 'F');
    doc.setTextColor(185, 28, 28); // red-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CERTIFIED AVERAGE GPA', 145, 99);
    doc.setFontSize(12);
    doc.text(avgGradePr > 0 ? `${avgGradePr}%` : 'N/A', 145, 108);

    // Section 1: Written Worksheet Performance
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SECTION A: WRITTEN SUBMISSIONS & GRADING REPORT', 10, 122);
    doc.setFillColor(15, 23, 42);
    doc.rect(10, 124, 190, 0.4, 'F');

    let currentY = 130;

    // Table Header for Written submissions
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(10, currentY, 190, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('ASSIGNMENT SHEET TITLE', 14, currentY + 5);
    doc.text('POINTS', 100, currentY + 5);
    doc.text('EVALUATION FEEDBACK FROM ATM SIR', 125, currentY + 5);

    currentY += 7;

    if (studentSubmissions.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('No written assignment submissions tracked in this ledger table.', 14, currentY + 7);
      currentY += 12;
    } else {
      studentSubmissions.forEach((sub, idx) => {
        const isTest = !!sub.testId;
        const testRel = isTest ? (chapterMaterials || []).find(m => m && m.id === sub.testId) : null;
        const relatedAss = !isTest ? assignments.find(a => a.id === sub.assignmentId) : null;
        const titleText = isTest ? `Secure Test: ${testRel?.title || 'Comprehensive Written Test'}` : (relatedAss?.title || 'Unknown Assignment');
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        
        // Draw alternate rows
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, currentY, 190, 10, 'F');
        }

        // Title (wrapped if too long)
        const titleShort = titleText.length > 40 ? titleText.substring(0, 38) + '...' : titleText;
        doc.setFont('helvetica', 'bold');
        doc.text(titleShort, 14, currentY + 6);

        // Grade Score
        doc.setFont('helvetica', 'bold');
        if (sub.status === 'graded' && sub.grade) {
          doc.setTextColor(21, 128, 61); // green-700
          doc.text(`${sub.grade.score} / ${sub.grade.points}`, 100, currentY + 6);
        } else {
          doc.setTextColor(245, 158, 11); // amber-500
          doc.text('Pending Action', 100, currentY + 6);
        }

        // Feedback truncate
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        const feedbackRaw = sub.grade?.feedback || 'Awaiting teacher evaluation review and performance validation.';
        const feedbackText = feedbackRaw.length > 55 ? feedbackRaw.substring(0, 52) + '...' : feedbackRaw;
        doc.text(feedbackText, 125, currentY + 6);

        currentY += 10;
      });
    }

    currentY += 5;

    // Section 2: Quizzes Performance
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SECTION B: DIRECT COGNITIVE QUIZZES INTELLIGENCE LEDGER', 10, currentY);
    doc.setFillColor(15, 23, 42);
    doc.rect(10, currentY + 2, 190, 0.4, 'F');

    currentY += 8;

    // Table Header for Quizzes
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(10, currentY, 190, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('QUIZ MODULE TITLE', 14, currentY + 5);
    doc.text('RAW SCORE', 90, currentY + 5);
    doc.text('PERCENTAGE', 120, currentY + 5);
    doc.text('SPEED INDEX', 155, currentY + 5);

    currentY += 7;

    if (studentAttempts.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('No interactive quiz module attempts tracked in this ledger table.', 14, currentY + 7);
      currentY += 12;
    } else {
      studentAttempts.forEach((attempt, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        
        // Draw alternate rows
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, currentY, 190, 8, 'F');
        }

        const titleShort = attempt.quizTitle.length > 40 ? attempt.quizTitle.substring(0, 38) + '...' : attempt.quizTitle;
        doc.text(titleShort, 14, currentY + 5);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${attempt.score} / ${attempt.maxScore}`, 90, currentY + 5);

        const pct = Math.round((attempt.score / attempt.maxScore) * 100);
        // RGB Colors
        doc.text(`${pct}%`, 120, currentY + 5);

        doc.setFont('helvetica', 'normal');
        const secs = Math.round(attempt.timeSpentMs / 1000);
        doc.text(`${secs} seconds`, 155, currentY + 5);

        currentY += 8;
      });
    }

    // Authenticity Bottom Block
    currentY = 245; // Fixed position near page bottom
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, currentY, 190, 42, 'FD');

    // Bottom verification label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('SYSTEM DIGITAL CRYPTO VERIFICATION SIGNATURE', 15, currentY + 6);
    doc.setTextColor(15, 23, 42);
    
    // Draw signature line
    doc.line(14, currentY + 28, 84, currentY + 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ATM SIR - ACADEMIC COMPTROLLER', 14, currentY + 32);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorised eShikshaPie Lead Teacher & Sandbox Supervisor', 14, currentY + 36);

    // Draw Stamp badge
    doc.setFillColor(30, 41, 59); // dark stamp rect
    doc.rect(155, currentY + 5, 38, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('eSHIKSHAPIE', 160, currentY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('DIGITAL ACCREDITED', 160, currentY + 17);
    doc.text('SYSTEM APPROVED', 160, currentY + 21);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(249, 115, 22); // Orange 500
    doc.text(`VERIFIED KEY: ${std.accessCode}`, 160, currentY + 30);

    // Digest security string
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`Secured Record ID: md5-digest:${std.id}-${std.name.replace(/\s+/g, '')}-${Date.now()}`, 14, currentY + 13);
    doc.text('This digital report has been processed using sandboxed, fully compilable vector environments on the AI Studio Hub.', 14, currentY + 17);

    // Save as dynamic data URL
    const pdfDataUrl = doc.output('datauristring');
    
    // Register the PDF data Url with the API
    const reportCardId = `report-${std.id}`;
    
    try {
      const res = await fetch('/api/pdf/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: reportCardId,
          pdfUrl: pdfDataUrl
        })
      });
      if (res.ok) {
        // Open in a new window/tab as clean PDF stream
        window.open(`/api/pdf/view/${reportCardId}`, '_blank');
      } else {
        throw new Error(`Response status ${res.status}`);
      }
    } catch (e) {
      console.log("[eShiksha PDF Engine INFO] Offline preview or container fallback. Direct file download initiated.", e);
      // Fallback: download directly
      doc.save(`Academic_Report_Card_${std.name}.pdf`);
    }
  };

  // Floating PDF modal viewer states
  const [viewerPDF, setViewerPDF] = useState<Assignment | null>(null);
  const [viewerMode, setViewerMode] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    if (viewerPDF) {
      setViewerMode('pdf');
    }
  }, [viewerPDF]);

  // Form Fields - Student Creation & Access Credentials
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentClass, setNewStudentClass] = useState<ClassGrade>('Class 12');
  const [newStudentAccessCode, setNewStudentAccessCode] = useState('');
  const [studentCreationError, setStudentCreationError] = useState('');
  const [studentCreationSuccess, setStudentCreationSuccess] = useState('');

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentCreationError('');
    setStudentCreationSuccess('');

    const formattedName = newStudentName.trim();
    const formattedEmail = newStudentEmail.trim().toLowerCase();
    const formattedCode = newStudentAccessCode.trim();

    if (!formattedName || !formattedEmail || !formattedCode) {
      setStudentCreationError('Please fill out all fields and generate/input a secured access key.');
      return;
    }

    if (students.some(s => s.email.toLowerCase() === formattedEmail)) {
      setStudentCreationError('A student with this email address is already enrolled.');
      return;
    }

    const brandNewStudent: Student = {
      id: 's-' + Date.now(),
      name: formattedName,
      enrolledClass: newStudentClass,
      avatar: `https://images.unsplash.com/photo-${1539571696357 + Math.floor(Math.random() * 5000000)}?w=100&h=100&fit=crop`,
      email: formattedEmail,
      accessCode: formattedCode
    };

    onAddStudent(brandNewStudent);
    setStudentCreationSuccess(`Successfully enrolled ${formattedName} in ${newStudentClass}! Access Code issued: ${formattedCode}`);
    
    // reset inputs
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentAccessCode('');
  };

  const handleGenerateStudentAccessKey = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz'; // readable subset (omitted confusing characters like l/o)
    const nums = '23456789';
    let output = '';
    for (let i = 0; i < 3; i++) {
      output += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 3; i++) {
      output += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    setNewStudentAccessCode(output.toUpperCase());
  };

  // Class Selection array 1 to 12, IIT-JEE, NEET
  const ALL_CLASSES: ClassGrade[] = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
    'Class 11', 'Class 12', 'IIT-JEE', 'NEET'
  ];

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const matched = teachers.find(
      t => t.subject === subjectInput && 
      t.credential === credentialInput.trim()
    );
    if (matched) {
      setTeacher(matched);
      setCredentialInput('');
    } else {
      setLoginError(`Invalid credential/passphrase for Department: ${subjectInput}. Please note that self-registration is disabled. Access credentials must be requested from the Administrator and generated via the Admin Control Dashboard.`);
    }
  };

  // Close Account / Terminate Access handler
  const handleCloseAccount = () => {
    if (!teacher) return;
    const updated = teachers.filter(t => t.id !== teacher.id);
    onSetTeachers(updated);
    setTeacher(null);
    setSelectedDrillDownStudent(null);
    setGradingSelectedSub(null);
  };

  // Log Out handler
  const handleLogOut = () => {
    setTeacher(null);
    setSelectedDrillDownStudent(null);
    setGradingSelectedSub(null);
  };

  // Real PDF file reader to convert uploaded files to Base64 data URLs
  const handleMockPDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedPDFName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setUploadedPDFUrl(base64Url);

      // Create structured fallback text for simulated AI generation guidelines
      let mockExtracted = `PHYSICAL NOTES FROM PDF: ${file.name}\n`;
      if (teacher?.subject === 'Physics') {
        mockExtracted += `PHYSICS CHAPTER WORK & POWER FIELD:\n1. A particle of mass m undergoes motion bounded under harmonic force F = -kx.\n2. Potential energy V(x) = (1/2)kx² represents localized stability configurations.\n3. Frictionless systems conserve dynamic mechanical energy: E_total = K_energy + P_energy.\n4. Work Done is the line integral of force dot displacement vectors across trajectory path contours.`;
      } else if (teacher?.subject === 'Chemistry') {
        mockExtracted += `CHEMISTRY CORE VALENCE SHELL BONDING:\n1. Organic molecular geometry utilizes orbital hybridization. SP3 creates tetrahedral structures.\n2. Lone pairs generate electronic repulsion shifting atomic nodes from perfect symmetry angles (e.g. water angle is 104.5 degrees).\n3. Ionic attraction depends on electrostatic Coulomb binding energy vs thermal randomization states.`;
      } else if (teacher?.subject === 'Mathematics') {
        mockExtracted += `MATHEMATICS INTEGRAL CALCULUS REFERENCE:\n1. Integration represents the infinite cumulative limit sum of infinitesimal strip areas.\n2. Fundamental theorem: Integral of f(x) from a to b = F(b) - F(a) where F\'(x) = f(x).\n3. Integration by parts: Integral(u dv) = u v - Integral(v du) evaluates algebraic-exponential complexes quickly.`;
      } else if (teacher?.subject === 'Biology') {
        mockExtracted += `BIOLOGY BIO-SYSTEMS AND RESPIRATION:\n1. Photosynthesis transforms light photons, carbon dioxide, and water into carbohydrate compounds and free oxygen.\n2. Cell respiration occurs primarily inside the mitochondrial double membrane using enzymes.\n3. The ATP cycle binds and releases thermodynamic chemical energy in active cell processes.`;
      } else {
        mockExtracted += `ENGLISH LITERATURE SYMBOLISM MATRIX:\n1. Metaphors compare two unlike objects to signify a deeper truth (e.g., Hamlet's 'sea of troubles').\n2. Tone communicates the author's emotional posture towards subjects (solemn, critical, mock-heroic).\n3. Dramatic irony occurs when audience members hold knowledge characters are missing.`;
      }
      
      setExtractedPDFText(mockExtracted);
      setQuizSourceText(mockExtracted); // Pre-fill AI quiz context
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleQuizPDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQuizPDF(true);
    setQuizPDFName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setQuizPDFUrl(base64Url);

      let mockExtracted = `COMPREHENSIVE CHAPTER DOCUMENT: ${file.name}\n\n`;
      const subject = teacher?.subject || 'General';
      if (subject === 'Physics') {
        mockExtracted += `SUBJECT: ADVANCED PHYSICS STUDY PACKET\n` +
          `1. ELECTROMAGNETIC FORCE & POWER: Oscillating electric fields create self-propagating electromagnetic radiation at speed c = 3 x 10^8 m/s.\n` +
          `2. NEWTONIAN MECHANICS CONCEPTS: Conservation of dynamic mechanical energy in conservative systems: Total Energy = Kinetic Energy + Potential Energy.\n` +
          `3. GIBBS THERMODYNAMICS: Heat transfer follows thermodynamic laws where entropy increases in isolated spontaneous systems.\n` +
          `4. COOPERATIVE SYSTEMS: Particle displacement is calculated by line integration of force over physical pathways.`;
      } else if (subject === 'Chemistry') {
        mockExtracted += `SUBJECT: ORGANIC MOLECULAR REACTION DYNAMICS\n` +
          `1. MECHANISM OF PATHWAYS: Nucleophilic substitution proceeds via unimolecular (SN1) or bimolecular (SN2) pathways.\n` +
          `2. INTERMEDIATE IONIC FORMS: SN1 reactions feature a rate-determining carbocation intermediate, highly stabilized in polar protic solvents.\n` +
          `3. CONCERTED STEREOCHEMICAL STATE: SN2 reactions proceed in a single step with a pentacoordinate transition state leading to total Walden inversion.\n` +
          `4. REACTION KINETICS: Primary substrates are extremely reactive for SN2, while tertiary carbon centers are inert to SN2 due to bulk steric hindrance.`;
      } else if (subject === 'Mathematics') {
        mockExtracted += `SUBJECT: MULTIVARIABLE VECTOR CALCULUS & FORMULAS\n` +
          `1. DEFINITION OF GRAPH GRADIENT: The gradient vector directional derivates represent the direction of fastest increase of scalar f(x, y, z).\n` +
          `2. ADVANCED VECTOR THEOREMS: Stokes' Theorem relates the line integral of a vector field along a loop to the curl of that field over a surface.\n` +
          `3. GAUSS INTEGRATION THEOREMS: The divergence theorem maps the volumetric flux density to boundaries, illustrating conservation properties.\n` +
          `4. COMPLEX INTEGRALS: Fundamental integration by parts represents reversing the product rule for continuous differentials: Int(u dv) = uv - Int(v du).`;
      } else if (subject === 'Biology') {
        mockExtracted += `SUBJECT: ORGANIC GENETICS & MOLECULAR RESPIRATION\n` +
          `1. TRANSCRIPTION PROTOCOLS: Homologous RNA polymerase transcriber copies DNA into messenger RNA templates inside cellular nuclei.\n` +
          `2. BIO-SYNTHESIS OF PROTEINS: Ribosomal anticodons translate mRNA codons into structural polypeptide protein sequences.\n` +
          `3. MENDELIAN COMBINATORIAL RULES: Alleles segregation and independent assortment govern phenotypic traits inheritance distributions.\n` +
          `4. MITOSPINDLE CELL MEIOSIS: Chromosomal crossing over during gamete division introduces massive genetic variation profiles.`;
      } else {
        mockExtracted += `SUBJECT: LITERARY CORE ANALYSIS WORKBOOK\n` +
          `1. ARCHE TYPE CHARACTERS: Literary thesis statements establish arguable central assertions within research papers.\n` +
          `2. PHRASES COHESION: Sentence structuring requires transitions, coherent outlines, and paragraph subject boundaries.\n` +
          `3. ALLOGORICAL SYMBOLISM: Dynamic irony occurs when viewers share information that main characters do not possess.`;
      }

      setQuizSourceText(mockExtracted);
      setIsUploadingQuizPDF(false);
    };
    reader.onerror = () => {
      setIsUploadingQuizPDF(false);
    };
    reader.readAsDataURL(file);
  };

  // Action: Submit live class
  const handleCreateLiveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim()) return;

    let finalMeetLink = liveMeetLink.trim();
    if (!finalMeetLink) {
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      const r = (len: number) => Array.from({length: len}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      finalMeetLink = `https://meet.google.com/${r(3)}-${r(4)}-${r(3)}`;
    }

    onAddLiveClass({
      title: liveTitle.trim(),
      subject: teacher!.subject,
      targetClass: liveClassTarget,
      teacherId: teacher!.id,
      teacherName: teacher!.name,
      scheduledAt: liveClassDate ? new Date(liveClassDate).toISOString() : new Date().toISOString(),
      isLive: false,
      meetLink: finalMeetLink
    });
    setLiveTitle('');
    setLiveMeetLink('');
    setCreateLiveOpen(false);
  };

  // Action: Submit assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;
    onAddAssignment({
      title: assignTitle.trim(),
      subject: teacher!.subject,
      targetClass: assignClass,
      dueDate: assignDueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      points: Number(assignPoints) || 100,
      description: assignDesc.trim(),
      pdfUrl: uploadedPDFUrl || undefined,
      pdfName: uploadedPDFName || undefined,
      pdfText: extractedPDFText || undefined
    });
    setAssignTitle('');
    setAssignDesc('');
    setUploadedPDFName('');
    setUploadedPDFUrl('');
    setExtractedPDFText('');
    setCreateAssignOpen(false);
  };

  // Action: Generate Quiz via actual server-side Gemini call!
  const handleAIGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizError('');
    setIsGeneratingQuiz(true);

    try {
      const response = await fetch('/api/gemini/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: quizPrompt.trim(),
          documentText: quizSourceText.trim(),
          pdfBase64: quizPDFUrl || undefined,
          subject: teacher!.subject,
          targetClass: quizClassTarget
        })
      });

      if (!response.ok) {
        throw new Error('Server service failed to generate quiz. Falling back to procedural.');
      }

      const generatedData = await response.json();
      
      // Save quiz to state with a unique id
      const newQuiz: Quiz = {
        id: 'quiz-' + Date.now(),
        title: generatedData.title || `Interactive ${teacher!.subject} Quiz`,
        subject: teacher!.subject,
        targetClass: quizClassTarget,
        questions: generatedData.questions.map((q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          text: q.text,
          options: q.options,
          correctAnswerIndex: Number(q.correctAnswerIndex),
          explanation: q.explanation
        })),
        createdAt: new Date().toISOString(),
        deadline: quizDeadline || undefined,
        autoDeleteAfterDeadline: quizDeadline ? quizAutoDelete : false
      };

      onAddQuiz(newQuiz);
      
      // Cleanup
      setQuizPrompt('');
      setQuizSourceText('');
      setQuizPDFName('');
      setQuizPDFUrl('');
      setQuizDeadline('');
      setQuizAutoDelete(false);
      setCreateQuizOpen(false);
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || 'Error executing AI generation script. Verify connectivity.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Action: Autograde written work via server-side Gemini AI call!
  const handleAIAutomatedGrading = async (sub: Submission, maxPoints: number) => {
    setIsGradingId(sub.id);
    
    // Find assignment details
    const relatedAssignment = assignments.find(a => a.id === sub.assignmentId);

    try {
      const response = await fetch('/api/gemini/grade-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNotes: sub.studentNotes,
          assignmentTitle: relatedAssignment?.title || 'Classroom Assignment',
          assignmentDescription: relatedAssignment?.description || '',
          pdfText: relatedAssignment?.pdfText || '',
          points: maxPoints
        })
      });

      if (!response.ok) {
        throw new Error('Autograde response failed.');
      }

      const gradedOutcome = await response.json();
      
      setGradingScore(gradedOutcome.score);
      setGradingFeedback(gradedOutcome.feedback);
      setGradingSelectedSub(sub);
    } catch (err) {
      console.error('Error in automated grading:', err);
    } finally {
      setIsGradingId(null);
    }
  };

  // Submit final graded status
  const handlePublishGrade = () => {
    if (!gradingSelectedSub) return;
    onGradeSubmission(
      gradingSelectedSub.id,
      gradingScore,
      gradingFeedback
    );
    setGradingSelectedSub(null);
    setGradingFeedback('');
    setGradingScore(0);
  };

  // Filters for teacher view (Only shows material matching the logged-in teacher's subject!)
  const filteredLiveClasses = liveClasses.filter(lc => teacher && lc.subject === teacher.subject);
  const filteredAssignments = assignments.filter(a => teacher && a.subject === teacher.subject);
  const filteredQuizzes = quizzes.filter(q => teacher && q.subject === teacher.subject);
  
  const isSubjectMatching = (teacherSubject: string, materialSubject: string): boolean => {
    const ts = teacherSubject.toLowerCase();
    const ms = materialSubject.toLowerCase();
    if (ts === 'mathematics' && ms === 'maths') return true;
    if (ts === 'physics' || ts === 'chemistry' || ts === 'biology') {
      return ms === 'science';
    }
    if (ts === 'english') return ms === 'sst' || ms === 'mental ability' || ms === 'science' || ms === 'maths';
    return ts.includes(ms) || ms.includes(ts);
  };

  // Submissions associated with assignments of this teacher's subject OR tests matching subject
  const currentSubjectAssignmentIds = filteredAssignments.map(a => a.id);
  const filteredSubmissions = submissions.filter(sub => {
    if (!teacher) return false;
    if (sub.testId) {
      const mat = (chapterMaterials || []).find(m => m && m.id === sub.testId);
      if (!mat) return false;
      return isSubjectMatching(teacher.subject, mat.subject);
    }
    return currentSubjectAssignmentIds.includes(sub.assignmentId);
  });

  // Top 10 performer calculation from ALL completed quiz attempts
  // Criteria: "top 10 performer according to their performance to complete quiz and time spent"
  // Order priority:
  // 1: Higher score proportion (score / maxScore)
  // 2: Ascending time spent (lower time spent is better!)
  const sortedLeaderboard: QuizAttempt[] = [...quizAttempts]
    .sort((a, b) => {
      const parentA = a.score / a.maxScore;
      const parentB = b.score / b.maxScore;
      if (parentB !== parentA) {
        return parentB - parentA; // descending score ratio
      }
      return a.timeSpentMs - b.timeSpentMs; // ascending speed
    })
    .slice(0, 10);

  // If NOT logged in, show Login Screen
  if (!teacher) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 text-slate-800" id="teacher-auth-card">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-3 text-indigo-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">eShikshaPie Instructors</h2>
          <p className="text-slate-500 text-xs text-center mt-1">Access your authorized subject department workspace.</p>
        </div>

        {loginError && (
          <div className="mb-4 text-rose-600 text-xs flex items-start space-x-1.5 bg-rose-50 border border-rose-100 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Subject Department</label>
            <select
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value as Subject)}
              className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-semibold transition"
              id="select-teacher-subject"
            >
              <option value="Physics">Department of Physics</option>
              <option value="Chemistry">Department of Chemistry</option>
              <option value="Mathematics">Department of Mathematics</option>
              <option value="Biology">Department of Biology</option>
              <option value="Science">Department of Science</option>
              <option value="English">Department of English</option>
              <option value="Hindi">Department of Hindi</option>
              <option value="Social Science">Department of Social Science</option>
              <option value="Sanskrit">Department of Sanskrit</option>
              <option value="Urdu">Department of Urdu</option>
              <option value="Health and Physical Education">Department of Health & PE</option>
              <option value="Accounts">Department of Accounts</option>
              <option value="Business">Department of Business</option>
              <option value="Economic">Department of Economics</option>
              <option value="Commerce">Department of Commerce</option>
              <option value="Mental Ability">Department of Mental Ability</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Passphrase Key</label>
            <input
              type="password"
              placeholder="Enter secure passphrase..."
              value={credentialInput}
              onChange={(e) => setCredentialInput(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition font-mono"
              id="input-teacher-credential"
              required
            />
          </div>

          <div className="p-3 bg-indigo-50/50 border border-indigo-100/30 rounded-xl space-y-1">
            <span className="text-[10px] text-indigo-750 font-bold uppercase tracking-wider block font-sans">🛡️ SECURED CREDENTIAL POLICY</span>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Instructors cannot self-register. Please contact the Institution Administrator to obtain your system-generated subject access keys, managed on the <strong>Admin Control Panel</strong>.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-xl transition shadow-md shadow-indigo-500/10 active:scale-95 duration-100 mt-2"
            id="btn-teacher-login"
          >
            Access Subject Workspace
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="teacher-portal-workspace">
      {/* Teacher Workspace Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg">
            {teacher.subject.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{teacher.name}</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                {teacher.subject} CHAIR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage virtual courses, assignments, AI quiz matrices, & check overall student performance.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLogOut}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1"
            id="btn-teacher-workspace-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Session</span>
          </button>

          {showCloseConfirm ? (
            <button
              onClick={() => {
                handleCloseAccount();
                setShowCloseConfirm(false);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1"
              id="btn-teacher-workspace-close-account-confirm"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Delete Account!</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCloseConfirm(true)}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1"
              id="btn-teacher-workspace-close-account"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Close Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile-optimized select dropdown for device adaptive navigation in Teacher Workspace */}
      <div className="block md:hidden mb-4 relative z-20">
        <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
          ⭐ SELECT TEACHER WORKSPACE MODULE
        </label>
        <select
          value={activeTab}
          onChange={(e) => {
            setActiveTab(e.target.value as any);
            setSelectedDrillDownStudent(null);
            setGradingSelectedSub(null);
          }}
          className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
        >
          <option value="live">Virtual Live Streams</option>
          <option value="assignments">Assignments Desk</option>
          <option value="quizzes">Dynamic Quizzes</option>
          <option value="tests">Secure Written Tests</option>
          <option value="grading">Autograde Room ({filteredSubmissions.filter(s => s.status === 'submitted').length})</option>
          <option value="students">Student Matrix Tracker</option>
          <option value="materials">Chapters & Materials Uploader</option>
          <option value="leaderboard">Top 10 Performers</option>
          <option value="certificates">Credentials & Certificates</option>
          <option value="doubts">🙋‍♂️ Study Class & Doubts</option>
        </select>
      </div>

      {/* Teachers Tab Switcher - Hidden on small mobile screens, shown from md screen on */}
      <div className="hidden md:flex border-b border-slate-200 overflow-x-auto pb-px space-x-2 no-scrollbar">
        {[
          { id: 'live', label: 'Virtual Live Streams', icon: Calendar },
          { id: 'assignments', label: 'Assignments Desk', icon: FileText },
          { id: 'quizzes', label: 'Dynamic Quizzes', icon: BookOpen },
          { id: 'tests', label: 'Secure Written Tests', icon: GraduationCap },
          { id: 'grading', label: `Autograde Room (${filteredSubmissions.filter(s => s.status === 'submitted').length})`, icon: Cpu },
          { id: 'students', label: 'Student Matrix Tracker', icon: Users },
          { id: 'materials', label: 'Chapters & Materials Uploader', icon: UploadCloud },
          { id: 'leaderboard', label: 'Top 10 Performers', icon: Trophy },
          { id: 'certificates', label: 'Credentials & Certificates', icon: Award },
          { id: 'doubts', label: '🙋‍♂️ Study Class & Doubts', icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedDrillDownStudent(null);
                setGradingSelectedSub(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all border-t-2 ${
                activeTab === tab.id 
                  ? 'border-blue-600 bg-white text-blue-600 shadow-inner' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id={`tab-teacher-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Live Class Stream Section */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Scheduled live broadcasts */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Dynamic Video Streams & Whiteboarding</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure classes 1-12 or special JEE/NEET prep panels.</p>
            </div>
            <button
              onClick={() => setCreateLiveOpen(!createLiveOpen)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
              id="btn-open-create-live"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Live Class</span>
            </button>
          </div>

          <AnimatePresence>
            {createLiveOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
              >
                <form onSubmit={handleCreateLiveClass} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Live Topic Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Angular Velocities of Satellite Arrays" 
                        value={liveTitle} 
                        onChange={(e) => setLiveTitle(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Target Student Class</label>
                      <select 
                        value={liveClassTarget} 
                        onChange={(e) => setLiveClassTarget(e.target.value as ClassGrade)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                      >
                        {ALL_CLASSES?.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Google Meet URL / Link</span>
                        <button
                          type="button"
                          onClick={() => window.open('https://meet.google.com/new', '_blank')}
                          className="text-[#1a73e8] hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          🌐 Launch Real Google Meet Room
                        </button>
                      </label>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="https://meet.google.com/abc-defg-hij" 
                          value={liveMeetLink} 
                          onChange={(e) => setLiveMeetLink(e.target.value)} 
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const letters = 'abcdefghijklmnopqrstuvwxyz';
                            const r = (len: number) => Array.from({length: len}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
                            setLiveMeetLink(`https://meet.google.com/${r(3)}-${r(4)}-${r(3)}`);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] px-2.5 rounded-xl transition font-mono font-bold shrink-0 cursor-pointer"
                          title="Generate fresh Google Meet link"
                        >
                          Generate
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                        💡 <strong>Highly Recommended:</strong> Click <em>"Launch Real Google Meet Room"</em> to get a live, authenticated room code from Google, then paste it here for instant student access.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Schedule Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={liveClassDate} 
                        onChange={(e) => setLiveClassDate(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setCreateLiveOpen(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow"
                    >
                      Add Live Slot
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLiveClasses.map((lc) => (
              <div key={lc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-bold uppercase">
                        {lc.targetClass}
                      </span>
                      {lc.isLive && (
                        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-bold animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteLiveClass(lc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Delete live class slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{lc.title}</h4>
                  <p className="text-slate-500 text-xs mt-2 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>Scheduled Slot: {new Date(lc.scheduledAt).toLocaleString()}</span>
                  </p>
                  
                  {editingMeetLinkId === lc.id ? (
                    <div className="mt-3 bg-blue-50/50 border border-blue-100 p-2 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Update Google Meet Link</label>
                        <button
                          onClick={() => window.open('https://meet.google.com/new', '_blank')}
                          className="text-[8px] text-[#1a73e8] hover:underline font-bold font-mono cursor-pointer"
                        >
                          🌐 Launch Real Room First
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={editingMeetLinkUrl}
                          onChange={(e) => setEditingMeetLinkUrl(e.target.value)}
                          placeholder="https://meet.google.com/..."
                          className="flex-1 text-[10px] border border-blue-200 rounded-md px-2 py-1 bg-white font-mono text-slate-800"
                        />
                        <button
                          onClick={() => {
                            if (editingMeetLinkUrl.trim()) {
                              onUpdateLiveClass(lc.id, { meetLink: editingMeetLinkUrl.trim() });
                              setEditingMeetLinkId(null);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded transition whitespace-nowrap cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMeetLinkId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-[9px] font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 bg-blue-50/50 border border-blue-100/60 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1">
                      <span className="text-[10px] text-blue-700 truncate font-mono select-all font-bold flex-1">{lc.meetLink || 'No Meet Link'}</span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingMeetLinkId(lc.id);
                            setEditingMeetLinkUrl(lc.meetLink || '');
                          }}
                          className="text-[9px] bg-slate-100 text-slate-600 hover:bg-slate-200 px-1.5 py-0.5 rounded transition font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        {lc.meetLink && (
                          <a 
                            href={lc.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 rounded-lg font-black tracking-wider uppercase transition inline-flex items-center cursor-pointer"
                          >
                            External Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                  <button
                    onClick={() => onToggleLive(lc.id)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                      lc.isLive 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {lc.isLive ? '🔴 End Session Stream' : '🟢 Set Streaming Live'}
                  </button>

                  {lc.isLive && (
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-sm cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-white mr-1" />
                      <span>Join Google Meet</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Right Column: Urgency Countdown Board */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4" id="teacher_urgency_countdown_board">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                  Active Urgency Timer
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Control dynamic countdown shown in student sidebar.</p>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <form onSubmit={handlePublishCountdown} className="space-y-4">
              {/* Event/Countdown Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Countdown Title / Announcement</label>
                <textarea 
                  rows={2}
                  maxLength={100}
                  value={cdTitle}
                  onChange={(e) => setCdTitle(e.target.value)}
                  placeholder="e.g. Space Dynamics Revision Class"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white resize-none"
                  required
                />
              </div>

              {/* Target Date-Time Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={cdDateTime}
                  onChange={(e) => setCdDateTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white font-mono"
                  required
                />
              </div>

              {/* Goal Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Goal Type / Redirect Category</label>
                <select 
                  value={cdType}
                  onChange={(e) => setCdType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                >
                  <option value="live_class">📺 Upcoming Live Broadcast Class</option>
                  <option value="assignment">✍ Pending Homework Deadline</option>
                  <option value="custom">📖 Standard Study Centre Review</option>
                </select>
              </div>

              {/* Enable / Disable State checkbox */}
              <div className="flex items-center space-x-2 py-0.5">
                <input 
                  type="checkbox" 
                  id="urgency_timer_active" 
                  checked={cdActive}
                  onChange={(e) => setCdActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="urgency_timer_active" className="text-xs text-slate-700 font-semibold cursor-pointer select-none">
                  Activate timer count immediately in sidebar
                </label>
              </div>

              {/* Success Notification message */}
              {cdSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-[10px] uppercase font-bold tracking-wider animate-pulse flex items-center space-x-2 animate-bounce">
                  <span>✓ COUNTDOWN TIMER PUBLISHED SUCCESSFULLY!</span>
                </div>
              )}

              {/* Publish or Delete Action Buttons */}
              <div className="space-y-2 pt-1" id="urgency_countdown_actions">
                <button
                  type="submit"
                  className="w-full bg-[#0F0F12] hover:bg-[#1D1D24] text-white text-[10px] uppercase font-bold tracking-widest py-3 rounded-xl transition duration-150 cursor-pointer text-center"
                >
                  Publish Urgency Countdown
                </button>

                {countdownConfig?.isActive && (
                  <button
                    type="button"
                    onClick={handleDeleteCountdown}
                    className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-[10px] uppercase font-bold tracking-widest py-3 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Existing Timer</span>
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PDF Assignment Desk Section */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Assignment Creation & Upload Center</h3>
              <p className="text-xs text-slate-500 mt-0.5">Upload textbook chapters and assignments as PDF files.</p>
            </div>
            <button
              onClick={() => setCreateAssignOpen(!createAssignOpen)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
              id="btn-open-create-assign"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Assignment</span>
            </button>
          </div>

          <AnimatePresence>
            {createAssignOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
              >
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Assignment Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SN2 Nucleophilic Inversion Mechanics" 
                        value={assignTitle} 
                        onChange={(e) => setAssignTitle(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Target Class</label>
                      <select 
                        value={assignClass} 
                        onChange={(e) => setAssignClass(e.target.value as ClassGrade)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                      >
                        {ALL_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Target Points</label>
                      <input 
                        type="number" 
                        value={assignPoints} 
                        onChange={(e) => setAssignPoints(Number(e.target.value))} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Drag-and-Drop Mock PDF module */}
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white hover:bg-slate-50 transition flex flex-col items-center justify-center text-center relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleMockPDFUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                    {isUploading ? (
                      <span className="text-xs font-semibold text-slate-600">Processing PDF document...</span>
                    ) : uploadedPDFName ? (
                      <p className="text-xs text-slate-700">
                        📁 Attached: <span className="font-semibold text-blue-650">{uploadedPDFName}</span>
                      </p>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block">Drag & Drop or Click to Upload PDF</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Accepts standard PDF documents up to 10MB</span>
                      </div>
                    )}
                  </div>

                  {uploadedPDFName && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 select-none text-xs text-blue-800">
                      <span>📄 PDF document is loaded and ready! Students can read or query this worksheet directly.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Composite Instructions / Solver Guidelines</label>
                    <textarea
                      rows={3}
                      placeholder="Outline any special steps, submission dates, or detailed problem codes..."
                      value={assignDesc}
                      onChange={(e) => setAssignDesc(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-3 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setCreateAssignOpen(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Close Creator
                    </button>
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow"
                    >
                      Publish Assignment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((a) => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase border border-blue-100">
                    {a.targetClass}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Due: {a.dueDate} | {a.points} Pts
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{a.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{a.description}</p>
                
                {a.pdfName && (
                  <div className="bg-blue-50/40 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] mb-2 text-blue-900">
                    <span className="font-mono truncate mr-2">📄 {a.pdfName}</span>
                    <button
                      type="button"
                      onClick={() => setViewerPDF(a)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition shrink-0"
                    >
                      View PDF Document
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* AI Quiz Generator Section */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Dynamic AI Quiz Generator</h3>
              <p className="text-xs text-slate-500 mt-0.5">Empowered by server-side Gemini AI. Auto-generates clean academic quizzes from PDF texts.</p>
            </div>
            <button
              onClick={() => setCreateQuizOpen(!createQuizOpen)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
              id="btn-open-create-quiz"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Generate AI Quiz</span>
            </button>
          </div>

          <AnimatePresence>
            {createQuizOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md"
              >
                <form onSubmit={handleAIGenerateQuiz} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">Concept Topic Focus</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SN1 Mechanism of Tertiary Halides or Planck-Einstein Relation" 
                        value={quizPrompt} 
                        onChange={(e) => setQuizPrompt(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Target Student Profile</label>
                      <select 
                        value={quizClassTarget} 
                        onChange={(e) => setQuizClassTarget(e.target.value as ClassGrade)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      >
                        {ALL_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Drag-and-Drop Quiz PDF module */}
                  <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 bg-indigo-50/5 hover:bg-indigo-50/20 transition flex flex-col items-center justify-center text-center relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleQuizPDFUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-indigo-500 mb-1.5" />
                    {isUploadingQuizPDF ? (
                      <span className="text-xs font-semibold text-slate-600 animate-pulse">Parsing chapter resource PDF...</span>
                    ) : quizPDFName ? (
                      <p className="text-xs text-slate-700">
                        📄 Loaded source: <span className="font-bold text-indigo-600">{quizPDFName}</span>
                      </p>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-slate-700 block">Drag & Drop or Click to Attach Chapter reference PDF</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Gemini will automatically extract standard formulas, topics, and chapters from this PDF to build your quiz!</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Reference Materials (PDF Extract or Manual Raw Text)</label>
                    <textarea 
                      rows={4}
                      placeholder="Paste PDF text extracts or let standard textbook materials guide the AI creation..."
                      value={quizSourceText} 
                      onChange={(e) => setQuizSourceText(e.target.value)} 
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono bg-slate-50"
                    />
                    <p className="text-[10px] text-slate-450 mt-1">If you have uploaded a resource PDF above, the extracted text will automatically sync here!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Optional Deadline
                      </label>
                      <input 
                        type="datetime-local" 
                        value={quizDeadline} 
                        onChange={(e) => setQuizDeadline(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Specify date and time when the quiz should close or be deleted.</p>
                    </div>

                    <div className="flex items-start space-x-3 bg-slate-50 border border-slate-150 p-3 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="chk-auto-delete" 
                        checked={quizAutoDelete} 
                        onChange={(e) => setQuizAutoDelete(e.target.checked)} 
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                        disabled={!quizDeadline}
                      />
                      <div>
                        <label htmlFor="chk-auto-delete" className={`block text-xs font-bold ${quizDeadline ? 'text-slate-700' : 'text-slate-400'}`}>
                          Auto-Delete Quiz after Deadline Passes
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">If enabled, this quiz will be deleted automatically and permanently from the school system within 5 seconds of the deadline passing.</p>
                      </div>
                    </div>
                  </div>

                  {quizError && (
                    <div className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{quizError}</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setCreateQuizOpen(false)}
                      className="bg-white border border-slate-200 text-slate-600 font-semibold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isGeneratingQuiz}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md flex items-center space-x-2"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Prompting Gemini 3.5...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <span>Generate Quiz Frame</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuizzes.map((q) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded font-bold uppercase border border-teal-100">
                      {q.targetClass}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {q.questions.length} MCQ Questions
                      </span>
                      {onDeleteQuiz && (
                        <button
                          type="button"
                          onClick={() => onDeleteQuiz(q.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{q.title}</h4>
                  <div className="space-y-2 border-t border-slate-50 pt-2.5">
                    {q.questions.slice(0, 2).map((qn, idx) => (
                      <div key={qn.id} className="text-xs text-slate-600 flex items-start space-x-1">
                        <span className="font-bold text-slate-900">{idx + 1}.</span>
                        <span className="line-clamp-1">{qn.text}</span>
                      </div>
                    ))}
                    {q.questions.length > 2 && (
                      <span className="text-[10px] text-blue-500 font-semibold font-mono block">
                        + {q.questions.length - 2} more multiple choice cards...
                      </span>
                    )}
                  </div>
                </div>

                {q.deadline && (
                  <div className="mt-4 bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Deadline: {new Date(q.deadline).toLocaleString()}</span>
                    </span>
                    {q.autoDeleteAfterDeadline && (
                      <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase font-mono border border-rose-100">
                        Auto-Deletes
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Automated Grading Tab */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'grading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Student Submission Autograder</h3>
            <p className="text-xs text-slate-500">Run instant AI qualitative evaluations via the server-side Gemini 3.5-flash.</p>

            <div className="space-y-3">
              {filteredSubmissions.length === 0 ? (
                <div className="bg-slate-50 border border-slate-250 p-6 rounded-2xl text-center text-slate-500 text-xs">
                  No submissions submitted yet for assignments under {teacher.subject}.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isTest = !!sub.testId;
                  const testRel = isTest ? (chapterMaterials || []).find(m => m && m.id === sub.testId) : null;
                  const assignmentRel = !isTest ? assignments.find(a => a.id === sub.assignmentId) : null;
                  const title = isTest ? testRel?.title : assignmentRel?.title;
                  const targetClass = isTest ? (testRel?.targetClass || 'All Classes') : (assignmentRel?.targetClass || 'All');
                  const taskType = isTest ? `Secure Test (${testRel?.subType?.replace(/_/g, ' ').toUpperCase() || 'TEST'})` : 'Assignment';

                  return (
                    <div 
                      key={sub.id} 
                      className={`p-4 border rounded-2xl transition cursor-pointer flex flex-col justify-between ${
                        gradingSelectedSub?.id === sub.id 
                          ? 'border-blue-500 bg-blue-50/20' 
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                      onClick={() => {
                        setGradingSelectedSub(sub);
                        setGradingScore(sub.grade?.score || 0);
                        setGradingFeedback(sub.grade?.feedback || '');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800 text-sm">{sub.studentName}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-550 border px-1.5 py-0.2 rounded font-mono uppercase">
                              {targetClass}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{taskType}: {title}</span>
                        </div>

                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          sub.status === 'graded' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {sub.status === 'graded' ? 'Graded' : 'Pending Review'}
                        </span>
                      </div>

                      <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          ✍️ <span className="italic">"{sub.studentNotes}"</span>
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAIAutomatedGrading(sub, assignmentRel?.points || 100);
                          }}
                          disabled={isGradingId === sub.id}
                          className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                        >
                          {isGradingId === sub.id ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              <span>Autograding...</span>
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{sub.status === 'graded' ? 'Re-grade AI Model' : 'Grade with Gemini AI'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
            {gradingSelectedSub ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Grading Ledger: {gradingSelectedSub.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Edit score or save automated feedback directly.</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Max: {gradingSelectedSub.testId ? 100 : (assignments.find(a => a.id === gradingSelectedSub.assignmentId)?.points || 100)} Pts
                  </span>
                </div>

                {/* Received Student Solution and Notebook PDF display */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Materials</span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {gradingSelectedSub.studentNotes}
                  </div>
                  {gradingSelectedSub.submittedPdfUrl ? (
                    <div className="bg-blue-5/50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-600 font-bold flex items-center space-x-1.5 font-mono">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="line-clamp-1">{gradingSelectedSub.submittedFile || "student_notebook.pdf"}</span>
                      </span>
                      <a
                        href={`/api/pdf/view/${gradingSelectedSub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
                      >
                        Open Notebook PDF
                      </a>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No notebook PDF submitted.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Numeric Award Score</label>
                  <input 
                    type="number" 
                    value={gradingScore}
                    onChange={(e) => setGradingScore(Number(e.target.value))}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">AI Qualitative Commentary Evaluation</label>
                  <textarea 
                    rows={8}
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs text-slate-800 font-mono leading-relaxed"
                  />
                </div>

                <button
                  onClick={handlePublishGrade}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow"
                >
                  Publish Score & Update Student Report
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                <User className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-xs font-semibold">Select a submitted transaction panel to inspect, edit, and grade.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Student Progress Matrix Section */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Consolidated Classroom Tracking Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Satisfies: "all students are clearly visible to all for progress tracking." Review student scores across complete curricula and coordinate portal keys.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Table list card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 overflow-x-auto shadow-sm">
                <table className="w-full text-slate-800 text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 pl-2">Student Name</th>
                      <th className="pb-3">Enrolled target</th>
                      <th className="pb-3 text-center">Submissions</th>
                      <th className="pb-3 text-center">Avg Grade</th>
                      <th className="pb-3 pr-2 text-right">Progress Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((std) => {
                      // sub stats
                      const studentSubmissions = submissions.filter(s => s.studentId === std.id);
                      const gradedSubs = studentSubmissions.filter(s => s.status === 'graded');
                      const avgGradePr = gradedSubs.length > 0 
                        ? Math.round(gradedSubs.reduce((acc, current) => acc + (current.grade?.score || 0), 0) / gradedSubs.length)
                        : 0;
                      
                      return (
                        <tr key={std.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 pl-2 flex items-center space-x-2.5">
                            <img src={std.avatar} className="w-7 h-7 rounded-full border border-slate-100 object-cover" alt="" />
                            <div>
                              <span className="font-bold text-slate-800 block">{std.name}</span>
                              <span className="text-[10px] text-slate-500 leading-none block">{std.email}</span>
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded font-mono uppercase inline-block mt-1">KEY: {std.accessCode}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase font-mono">
                              {std.enrolledClass}
                            </span>
                          </td>
                          <td className="py-3 text-center font-bold font-mono">
                            {studentSubmissions.length}
                          </td>
                          <td className="py-3 text-center font-extrabold text-blue-600 font-mono">
                            {avgGradePr > 0 ? `${avgGradePr}%` : '—'}
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedDrillDownStudent(std);
                                generateReportCardPDF(std);
                              }}
                              className="text-blue-600 hover:text-blue-500 font-bold text-[10.5px] hover:underline cursor-pointer"
                            >
                              Inspection PDF report
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Enrollment Generator form card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Generate Student Credentials & Enroll</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Register new student profiles and instantly provision access codes for their separate logins.</p>
                </div>

                <form onSubmit={handleCreateStudentSubmit} className="space-y-4">
                  {studentCreationSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>{studentCreationSuccess}</span>
                    </div>
                  )}

                  {studentCreationError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl">
                      ❌ {studentCreationError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">FULL LEGAL NAME</label>
                      <input 
                        type="text"
                        placeholder="Anya Taylor"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none transition bg-slate-50/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">SECURE EMAIL ADDRESS</label>
                      <input 
                        type="email"
                        placeholder="anya.t@school.edu"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none transition bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">ENROLLED ACADEMIC TARGET CLASS</label>
                      <select
                        value={newStudentClass}
                        onChange={(e) => setNewStudentClass(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none transition bg-slate-50/50 cursor-pointer font-medium"
                      >
                        {ALL_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">SECURED PORTAL ACCESS PASSCODE / KEY</label>
                      <div className="flex space-x-2">
                        <input 
                          type="text"
                          placeholder="EX: TAY901"
                          value={newStudentAccessCode}
                          onChange={(e) => setNewStudentAccessCode(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 outline-none transition bg-slate-50/50 font-mono font-black uppercase text-indigo-700 tracking-wider"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleGenerateStudentAccessKey}
                          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-[10px] px-4 py-2.5 rounded-2xl transition duration-150 uppercase tracking-widest shrink-0"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl transition duration-200 uppercase tracking-widest flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>Enroll Student & Commemorate Credentials</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-inner">
              {selectedDrillDownStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                    <img src={selectedDrillDownStudent.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{selectedDrillDownStudent.name}</h4>
                      <p className="text-[10px] text-slate-500">Tracked Enrolled Class: <span className="font-bold text-indigo-600">{selectedDrillDownStudent.enrolledClass}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border rounded-2xl p-3 text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Quizzes Tackled</span>
                      <span className="text-xl font-black font-mono text-slate-800 mt-1 block">
                        {quizAttempts.filter(qa => qa.studentId === selectedDrillDownStudent.id).length}
                      </span>
                    </div>
                    <div className="bg-white border rounded-2xl p-3 text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Written Grades</span>
                      <span className="text-xl font-black font-mono text-slate-800 mt-1 block">
                        {submissions.filter(s => s.studentId === selectedDrillDownStudent.id && s.status === 'graded').length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recent Activity Log:</span>
                    
                    {quizAttempts.filter(qa => qa.studentId === selectedDrillDownStudent.id).map(attempt => (
                      <div key={attempt.id} className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 block line-clamp-1">{attempt.quizTitle}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Speed clock: {Math.round(attempt.timeSpentMs / 1000)} seconds</span>
                        </div>
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-mono">
                          {attempt.score}/{attempt.maxScore}
                        </span>
                      </div>
                    ))}

                    {submissions.filter(s => s.studentId === selectedDrillDownStudent.id).map(sub => {
                      const relAss = assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <div key={sub.id} className="bg-white border border-slate-200 p-2.5 rounded-xl text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 block line-clamp-1">{relAss?.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                              sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                          {sub.grade && (
                            <div className="mt-1 pb-1 pt-1 border-t border-slate-50 text-[10px] leading-relaxed text-slate-500 font-mono">
                              Score: <span className="font-bold text-slate-700">{sub.grade.score}/{sub.grade.points} Pts</span><br />
                              Feedback: <span className="italic">"{sub.grade.feedback.substring(0,60)}..."</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                  <BarChart2 className="w-12 h-12 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold">Click "Inspection PDF report" on the student list to visualize dynamic stats.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Top 10 Performers Leaderboard Panel */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-800">Subject Performance Arena</h3>
              <p className="text-xs text-slate-500">According to exact instructions: ranked by correctness (score) and ascending time spent completing quizzes.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden p-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500">
                  <th className="py-3 pl-2">Rank</th>
                  <th className="py-3">Student Athlete</th>
                  <th className="py-3">Target Level</th>
                  <th className="py-3">Quiz Answer Sheet</th>
                  <th className="py-3 text-center">Score Ratio</th>
                  <th className="py-3 text-right pr-2">Clock Time Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLeaderboard.map((item, index) => {
                  const studentRel = students.find(s => s.id === item.studentId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 pl-2">
                        {index === 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black text-[10px]">🏆 1s</span>}
                        {index === 1 && <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-black text-[10px]">🥈 2s</span>}
                        {index === 2 && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-black text-[10px]">🥉 3s</span>}
                        {index > 2 && <span className="font-mono text-slate-500 font-bold">#{index + 1}</span>}
                      </td>
                      <td className="py-3.5 flex items-center space-x-2">
                        <img src={studentRel?.avatar} className="w-7 h-7 rounded-full object-cover border border-slate-100" alt="" />
                        <span className="font-bold text-slate-800">{item.studentName}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                          {studentRel?.enrolledClass}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium truncate max-w-xs">{item.quizTitle}</td>
                      <td className="py-3.5 text-center font-bold text-slate-700">
                        {item.score} / {item.maxScore}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-mono font-bold text-blue-600">
                        {Math.floor(item.timeSpentMs / 1000)}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6.5. Secure Written Tests Desk */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>SECURE WRITTEN EXAMS & SUBJECTIVE TESTS DESK</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Draft and deploy structural exams: Weekly Tests, Chapter Unit Tests, Half Yearly Exams, or Yearly Mock Boards. Evaluate student hand-written PDFs and publish scores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Create test paper form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Deploy New Subjective Test</span>
              </h4>

              {testUploadSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testUploadSuccess}</span>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!mTitle.trim()) {
                  alert("Test Title is required!");
                  return;
                }
                const isChapterSpecific = mTestSubType === 'chapter_test' || mTestSubType === 'weekly_test';
                const finalChapterId = isChapterSpecific ? mChapterId.trim().toUpperCase() : 'ALL';
                const finalChapterName = isChapterSpecific ? mChapterName.trim() : 'Cumulative Syllabus Milestone';

                const newTest: ChapterMaterial = {
                  id: "test_" + Date.now(),
                  subject: mSubject,
                  targetClass: mTargetClass,
                  chapterId: finalChapterId,
                  chapterName: finalChapterName,
                  materialType: 'test',
                  subType: mTestSubType,
                  title: mTitle.trim(),
                  content: mContent.trim() || "No specific subjective prompt questions defined. Refer to the reference material or study manual.",
                  fileUrl: mFileUrl || undefined,
                  authorTeacher: teacher?.name || 'Subject Coordinator',
                  createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
                };

                onSetChapterMaterials([...(chapterMaterials || []), newTest]);
                setTestUploadSuccess(`Successfully deployed secure test "${mTitle}"!`);
                setMTitle('');
                setMContent('');
                setMFileUrl('');
                setTimeout(() => setTestUploadSuccess(''), 5000);
              }} className="space-y-4 text-xs font-medium">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Target Subject</label>
                    <select
                      value={mSubject}
                      onChange={(e) => setMSubject(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Health and Physical Education">Health and Physical Education</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Business">Business</option>
                      <option value="Economic">Economic</option>
                      <option value="Mental Ability">Mental Ability</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Target Class / Grade</label>
                    <select
                      value={mTargetClass}
                      onChange={(e) => setMTargetClass(e.target.value as ClassGrade)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <option value="IIT-JEE">IIT-JEE</option>
                      <option value="NEET">NEET</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Test Milestone Classification</label>
                  <select
                    value={mTestSubType}
                    onChange={(e) => setMTestSubType(e.target.value as any)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly_test">🗓️ WEEKLY EXAMINATION</option>
                    <option value="chapter_test">📁 CHAPTER-WISE UNIT TEST</option>
                    <option value="half_yearly_test">📈 HALF YEARLY REVIEW EXAM</option>
                    <option value="yearly_test">🏆 YEARLY MOCK BOARD EXAM</option>
                  </select>
                </div>

                {(mTestSubType === 'chapter_test' || mTestSubType === 'weekly_test' || mTestSubType === 'part_test') && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Chapter ID</label>
                      <input
                        type="text"
                        placeholder="CH-1"
                        value={mChapterId}
                        onChange={(e) => setMChapterId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Chapter Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Chemical Reactions"
                        value={mChapterName}
                        onChange={(e) => setMChapterName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Exam Sheet Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Solid State Physics Weekly Worksheet"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Core Subjective Questions / Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed instruction guidelines or enter the question papers contents directly..."
                    value={mContent}
                    onChange={(e) => setMContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Reference PDF / Scanned Document URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. /assignments/jee_maths_unit.pdf"
                    value={mFileUrl}
                    onChange={(e) => setMFileUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider py-3 rounded-xl transition shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish Examination Paper</span>
                </button>
              </form>
            </div>

            {/* Right Column: Manage deployed tests and grade submissions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Categorized Test Listings */}
              {(() => {
                const activeTests = (chapterMaterials || []).filter(m => m && m.materialType === 'test');

                const weekly = activeTests.filter(t => t.subType === 'weekly_test');
                const chapters = activeTests.filter(t => t.subType === 'chapter_test' || t.subType === 'part_test' || !t.subType);
                const halfYearly = activeTests.filter(t => t.subType === 'half_yearly_test' || t.subType === 'half_syllabus_test');
                const yearly = activeTests.filter(t => t.subType === 'yearly_test' || t.subType === 'full_syllabus_test');

                return (
                  <div className="space-y-6">
                    {/* Render Category Block Helper */}
                    {[
                      { key: 'weekly', title: '🗓️ WEEKLY TESTS', items: weekly },
                      { key: 'chapter', title: '📁 CHAPTER TESTS', items: chapters },
                      { key: 'half_yearly', title: '📈 HALF YEARLY TESTS', items: halfYearly },
                      { key: 'yearly', title: '🏆 YEARLY TESTS', items: yearly }
                    ].map((section) => (
                      <div key={section.key} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">
                            {section.title} ({section.items.length})
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SECURED EXAMPAPERS</span>
                        </div>

                        {section.items.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-3 text-center">
                            No examinations currently deployed under this track.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {section.items.map((test) => {
                              const testSubs = (submissions || []).filter(s => s && s.testId === test.id);
                              const ungradedCount = testSubs.filter(s => s.status === 'submitted').length;
                              const isManaging = managingTestId === test.id;

                              return (
                                <div key={test.id} className="border border-slate-100 bg-slate-50/40 rounded-2xl p-4 transition-all">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                                        <span className="text-[8px] font-mono font-black uppercase bg-slate-150 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                                          {test.subject}
                                        </span>
                                        <span className="text-[8px] font-mono font-black uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                          {test.targetClass || 'ALL CLASSES'}
                                        </span>
                                        {test.chapterId !== 'ALL' && (
                                          <span className="text-[8px] font-mono font-bold uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                                            {test.chapterId}: {test.chapterName}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="font-extrabold text-slate-800 text-sm">{test.title}</h5>
                                      <span className="text-[9px] font-mono text-slate-400 block mt-1">ISSUED DATE: {test.createdAt}</span>
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setManagingTestId(isManaging ? null : test.id)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition uppercase tracking-wide flex items-center space-x-1 border cursor-pointer ${
                                          isManaging
                                            ? 'bg-slate-800 text-white border-slate-800 shadow'
                                            : ungradedCount > 0
                                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-250 animate-pulse'
                                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                        }`}
                                      >
                                        <span>Manage Solutions ({testSubs.length})</span>
                                        {ungradedCount > 0 && (
                                          <span className="bg-rose-600 text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                            {ungradedCount}
                                          </span>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to retire and remove test paper "${test.title}"?`)) {
                                            onSetChapterMaterials((chapterMaterials || []).filter(m => m.id !== test.id));
                                          }
                                        }}
                                        className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-105 transition cursor-pointer"
                                        title="Retire Test"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expandable Manual Grading Panel for this specific test */}
                                  {isManaging && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3 bg-white p-3.5 rounded-xl border border-slate-100">
                                      <h6 className="text-[10px] font-mono font-black text-slate-450 uppercase tracking-widest border-b border-slate-50 pb-1.5">
                                        👉 Student Solutions Ledgers
                                      </h6>

                                      {testSubs.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic text-center py-2">
                                          No students have submitted handwritten solutions for this examination sheet yet.
                                        </p>
                                      ) : (
                                        <div className="space-y-3.5 animate-fadeIn">
                                          {testSubs.map((sub) => {
                                            const studentRel = students.find(s => s.id === sub.studentId);
                                            return (
                                              <div key={sub.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                                                <div className="space-y-1.5 flex-1 max-w-md">
                                                  <div className="flex items-center space-x-2">
                                                    <span className="font-extrabold text-slate-800 text-xs">
                                                      👤 {studentRel?.name || 'Academic Student'}
                                                    </span>
                                                    <span className="text-[8px] font-mono text-slate-400 uppercase">
                                                      ({studentRel?.enrolledClass})
                                                    </span>
                                                    <span className={`text-[8px] font-black uppercase border px-1.5 py-0.2 ${
                                                      sub.status === 'graded'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                      {sub.status.toUpperCase()}
                                                    </span>
                                                  </div>

                                                  <div className="bg-white p-2.5 rounded-lg border border-slate-150/40 text-[11px] leading-relaxed text-slate-600">
                                                    <span className="font-bold text-slate-700 block mb-0.5">Scanned Student Answer Book/Notes:</span>
                                                    <p className="italic">" {sub.studentNotes || 'No cover notes provided.'} "</p>
                                                    {sub.submittedPdfUrl && (
                                                      <div className="mt-2 flex items-center space-x-2">
                                                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                        <span className="font-mono text-[10px] text-zinc-500 break-all">{sub.submittedFile || 'Solution_Attachment.pdf'}</span>
                                                        <a
                                                          href={sub.submittedPdfUrl}
                                                          target="_blank"
                                                          rel="noreferrer"
                                                          className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded transition uppercase border border-blue-200 shrink-0"
                                                        >
                                                          Open Sheet ↗
                                                        </a>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {sub.status === 'graded' && (
                                                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 text-[11.5px]">
                                                      <span className="font-black text-emerald-800 block uppercase tracking-wider">
                                                        ★ GRADED: {sub.grade?.score} / 100 PTS
                                                      </span>
                                                      <p className="text-emerald-700 mt-1 italic font-medium">" {sub.grade?.feedback} "</p>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Manual grading panel */}
                                                <div className="w-full md:w-56 shrink-0 bg-white p-3 rounded-xl border border-slate-200/70 space-y-2.5">
                                                  <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider block border-b border-slate-50 pb-1">
                                                    MANUAL GRADING HUB
                                                  </span>
                                                  <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Award Points (0-100)</label>
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      max="100"
                                                      placeholder="Score"
                                                      value={testGradeScores[sub.id] !== undefined ? testGradeScores[sub.id] : (sub.grade?.score || '')}
                                                      onChange={(e) => setTestGradeScores({
                                                        ...testGradeScores,
                                                        [sub.id]: parseInt(e.target.value) || 0
                                                      })}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-xs"
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Instructor Evaluator Comments</label>
                                                    <textarea
                                                      rows={2}
                                                      placeholder="Excellent solution step logic..."
                                                      value={testGradeFeedbacks[sub.id] !== undefined ? testGradeFeedbacks[sub.id] : (sub.grade?.feedback || '')}
                                                      onChange={(e) => setTestGradeFeedbacks({
                                                        ...testGradeFeedbacks,
                                                        [sub.id]: e.target.value
                                                      })}
                                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[11px]"
                                                    />
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const score = testGradeScores[sub.id] !== undefined ? testGradeScores[sub.id] : (sub.grade?.score || 0);
                                                      const feedback = testGradeFeedbacks[sub.id] !== undefined ? testGradeFeedbacks[sub.id] : (sub.grade?.feedback || 'Evaluation complete.');
                                                      onGradeSubmission(sub.id, score, feedback);
                                                      alert(`Manually graded student: ${studentRel?.name || 'Student'}. Score: ${score}/100.`);
                                                    }}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold uppercase text-[9px] tracking-wider py-2 rounded-lg transition cursor-pointer"
                                                  >
                                                    Publish & Update Report Card
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. Chapters & Materials Uploader */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Syllabus Chapters & Material Manager</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload booklets, recorded videos, chapter tests, NCERT solutions, objective question banks, and revise formulas. All updates sync instantly to the Student Dashboard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Upload Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span>Upload New Resource</span>
              </h4>

              {mSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{mSuccess}</span>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!mChapterId.trim() || !mChapterName.trim() || !mTitle.trim()) {
                  alert("Chapter ID, Name, and Title are required!");
                  return;
                }
                const newMaterial: ChapterMaterial = {
                  id: "mat_custom_" + Date.now(),
                  subject: mSubject,
                  targetClass: mTargetClass,
                  chapterId: mChapterId.trim().toUpperCase(),
                  chapterName: mChapterName.trim(),
                  materialType: mType,
                  subType: mType === 'booklet' ? mSubType : (mType === 'test' ? mTestSubType : undefined),
                  title: mTitle.trim(),
                  content: mContent.trim() || "No detailed textbook narrative provided.",
                  videoUrl: mVideoUrl.trim() || undefined,
                  fileUrl: mFileUrl || undefined,
                  authorTeacher: teacher?.name || 'Department Chair',
                  createdAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
                };
                onSetChapterMaterials([...(chapterMaterials || []), newMaterial]);
                setMSuccess(`Uploaded "${mTitle}" for ${mSubject} ${mChapterId}!`);
                setMTitle('');
                setMContent('');
                setMVideoUrl('');
                setMFileName('');
                setMFileUrl('');
                setTimeout(() => setMSuccess(''), 5000);
              }} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Target Subject</label>
                    <select
                      value={mSubject}
                      onChange={(e) => setMSubject(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Health and Physical Education">Health and Physical Education</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Business">Business</option>
                      <option value="Economic">Economic</option>
                      <option value="Mental Ability">Mental Ability</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Target Class / Grade</label>
                    <select
                      value={mTargetClass}
                      onChange={(e) => setMTargetClass(e.target.value as ClassGrade)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <option value="IIT-JEE">IIT-JEE</option>
                      <option value="NEET">NEET</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Chapter ID</label>
                    <input
                      type="text"
                      placeholder="e.g. CH-1"
                      value={mChapterId}
                      onChange={(e) => setMChapterId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Chapter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Relations & Functions"
                      value={mChapterName}
                      onChange={(e) => setMChapterName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Material Type</label>
                    <select
                      value={mType}
                      onChange={(e) => setMType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="booklet">BOOKLET (Syllabus PDF/Text)</option>
                      <option value="video">VIDEO / LIVE CLIPS</option>
                      <option value="test">TEST / QUIZ MOCK</option>
                      <option value="ncert">NCERT SOLUTIONS</option>
                      <option value="question_bank">QUESTION BANKS (OBJ+SUBJ)</option>
                      <option value="revision_notes">REVISION NOTES</option>
                      <option value="mlc">M.L.C. (WEAK STUDENTS)</option>
                    </select>
                  </div>

                  {mType === 'booklet' ? (
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Booklet Section</label>
                      <select
                        value={mSubType}
                        onChange={(e) => setMSubType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="theory">THEORY</option>
                        <option value="examples">EXAMPLES</option>
                        <option value="pyq">PYQ (10 YEARS)</option>
                        <option value="practice">PRACTICE QUESTIONS</option>
                        <option value="dpp">DPP SHEETS</option>
                      </select>
                    </div>
                  ) : mType === 'test' ? (
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Written Test Section</label>
                      <select
                        value={mTestSubType}
                        onChange={(e) => setMTestSubType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="part_test">PART TEST (Chapter-wise only)</option>
                        <option value="half_syllabus_test">HALF SYLLABUS TEST (Cumulative)</option>
                        <option value="full_syllabus_test">FULL SYLLABUS TEST (Mock Board)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wide">Detailed Sub-Section</label>
                      <div className="bg-slate-100 text-slate-400 rounded-xl px-3 py-2 font-semibold border border-transparent select-none">
                        Not Applicable
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Resource Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Solved DPP Sheet No. 1"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Textbook Narrative / Questions / Formula List</label>
                  <textarea
                    rows={4}
                    placeholder="Provide the complete reading text, practice problems, math proofs, or curriculum outline here for students..."
                    value={mContent}
                    onChange={(e) => setMContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-medium font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {mType === 'video' ? (
                  <div className="space-y-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                    <div>
                      <label className="block text-indigo-900 font-bold mb-1 uppercase tracking-wide">Option A: Paste Live Stream or Online Video URL</label>
                      <input
                        type="text"
                        placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                        value={mVideoUrl}
                        onChange={(e) => setMVideoUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Specify YouTube, Google Drive, direct MP4, or cloud files.</span>
                    </div>

                    <div className="pt-3 border-t border-indigo-100/60">
                      <label className="block text-indigo-900 font-bold mb-1 uppercase tracking-wide">Option B: Upload Local Video File (.mp4, .webm, .mov, etc.)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="mat-video-file-upload"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setMFileName(file.name);
                            const r = new FileReader();
                            r.onload = (ev) => {
                              const resultStr = ev.target?.result as string;
                              setMFileUrl(resultStr);
                              setMVideoUrl(resultStr);
                            };
                            r.readAsDataURL(file);
                          }}
                        />
                        <label
                          htmlFor="mat-video-file-upload"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-2 rounded-xl cursor-pointer transition flex items-center space-x-1.5 text-xs shadow-sm"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{mFileName ? "Change Video File" : "Choose Local Video File"}</span>
                        </label>
                        <span className="text-[10px] text-slate-500 truncate max-w-[200px] font-mono">
                          {mFileName || "No local video selected"}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-500/80 mt-1.5 block font-medium">✨ Uploaded files will link as direct, secure eShikshaPie stream data.</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 uppercase tracking-wide">Attachment (Syllabus PDF / Booklet File)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="mat-file-upload"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setMFileName(file.name);
                          const r = new FileReader();
                          r.onload = (ev) => setMFileUrl(ev.target?.result as string);
                          r.readAsDataURL(file);
                        }}
                      />
                      <label
                        htmlFor="mat-file-upload"
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl cursor-pointer transition flex items-center space-x-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{mFileName ? "Change File" : "Choose File"}</span>
                      </label>
                      <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {mFileName || "No attachments selected"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload & Sync To Students</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right side: Materials List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Existing Chapters Repository</span>
                </h4>

                {!chapterMaterials || chapterMaterials.filter(Boolean).filter(m => m.materialType !== 'test').length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-medium">
                    No standard chapter study materials uploaded in the central system yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                    {chapterMaterials.filter(Boolean).filter(m => m.materialType !== 'test').map((mat) => (
                      <div key={mat.id} className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 rounded-2xl p-4 flex flex-col justify-between transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              <span className="text-[9px] bg-blue-100 text-blue-800 font-mono font-extrabold px-2 py-0.5 rounded-md">
                                {mat.subject}
                              </span>
                              <span className="text-[9px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                                {mat.chapterId}: {mat.chapterName}
                              </span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md uppercase">
                                {mat.materialType} {mat.subType ? `(${mat.subType})` : ''}
                              </span>
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                                {mat.targetClass || 'All Classes'}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-sm leading-tight uppercase">{mat.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 font-mono leading-relaxed bg-white border border-slate-100 rounded-lg p-2">
                              {mat.content}
                            </p>
                          </div>

                          {confirmDeleteId === mat.id ? (
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                onClick={() => {
                                  onSetChapterMaterials((chapterMaterials || []).filter(m => m && m.id !== mat.id));
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-black px-2 py-1 rounded-lg uppercase tracking-wide transition cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1 rounded-lg uppercase tracking-wide transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setConfirmDeleteId(mat.id);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-xl transition cursor-pointer shrink-0"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="text-[9px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-mono font-semibold">
                          <span>Updated by: {mat.authorTeacher}</span>
                          <span>Timestamp: {mat.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. Credentials & Certificate Generator Panel */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'certificates' && (
        <div className="space-y-6" id="teacher_certificates_panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <Award className="w-6 h-6 text-blue-600 animate-pulse" />
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Credential & Certificate Generator</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Design and award high-fidelity academic certificates of achievements manually. Colors, text fields, and signers are customizable. Download crisp print-ready PDFs instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Side */}
            <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-5 flex flex-col justify-between" id="cert_customizer_form">
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center space-x-1.5">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">Step 1</span>
                    <span>Customize Certificate Fields</span>
                  </h4>
                </div>

                {/* Student Quick Populator */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                    Quick-Select Student
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setCertRecipientName(val);
                    }}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Choose Enrolled Student --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.name}>
                        {student.name} ({student.enrolledClass})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Recipient Name Field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      value={certRecipientName}
                      onChange={(e) => setCertRecipientName(e.target.value)}
                      placeholder="e.g. Marceline Anderson"
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                    />
                  </div>

                  {/* Certificate Title */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                      Certificate Header Title
                    </label>
                    <input
                      type="text"
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                      placeholder="e.g. Certificate of Achievement"
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                    />
                  </div>

                  {/* Award Is Given To */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                      Presentation Subtitle
                    </label>
                    <input
                      type="text"
                      value={certSubtitle}
                      onChange={(e) => setCertSubtitle(e.target.value)}
                      placeholder="THE FOLLOWING AWARD IS GIVEN TO"
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                    />
                  </div>

                  {/* Citation text */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                      Detailed Award Citation / Description
                    </label>
                    <textarea
                      rows={3}
                      value={certDescription}
                      onChange={(e) => setCertDescription(e.target.value)}
                      placeholder="Reason for granting the award..."
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Date of Issue */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      placeholder="e.g. June 17, 2026"
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                    />
                  </div>

                  {/* Signers Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Left Signer Name
                      </label>
                      <input
                        type="text"
                        value={certLeftSignerName}
                        onChange={(e) => setCertLeftSignerName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-550 font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Left Signer Title
                      </label>
                      <input
                        type="text"
                        value={certLeftSignerTitle}
                        onChange={(e) => setCertLeftSignerTitle(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-550 font-medium text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Right Signer Name
                      </label>
                      <input
                        type="text"
                        value={certRightSignerName}
                        onChange={(e) => setCertRightSignerName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-550 font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        Right Signer Title
                      </label>
                      <input
                        type="text"
                        value={certRightSignerTitle}
                        onChange={(e) => setCertRightSignerTitle(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-550 font-medium text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Aesthetic options */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 mt-1">
                    <label className="block text-[9.5px] font-bold text-slate-650 uppercase tracking-wider">
                      Academic Core Theme Palette
                    </label>
                    <div className="flex items-center space-x-2.5">
                      {[
                        { hex: '#3E4B57', name: 'Slate Gray (Screenshot)' },
                        { hex: '#1E3A8A', name: 'Royal Ivy Blue' },
                        { hex: '#701A28', name: 'Imperial Maroon' },
                        { hex: '#14532D', name: 'Classic Ivy Forest' },
                        { hex: '#854D0E', name: 'Scholastic Gold' },
                        { hex: '#0F172A', name: 'Midnight Charcoal' }
                      ].map((col) => (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setCertBorderColor(col.hex)}
                          className={`w-6 h-6 rounded-full cursor-pointer transition border flex items-center justify-center ${
                            certBorderColor === col.hex ? 'ring-2 ring-blue-500 scale-115 shadow-sm' : 'border-slate-250 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Parchment option toggle */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="checkbox-texture"
                      checked={certHasTexture}
                      onChange={(e) => setCertHasTexture(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="checkbox-texture" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                      Enable Aged Linen Texture
                    </label>
                  </div>
                </div>
              </div>

              {/* PDF Actions Footer */}
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={downloadCertificatePDF}
                  className="w-full bg-[#0F0F12] hover:bg-slate-800 text-white text-[10px] uppercase font-black tracking-widest py-3.5 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                  id="btn-download-premium-cert"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Download Premium PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCertTitle('Certificate of Achievement');
                    setCertSubtitle('THE FOLLOWING AWARD IS GIVEN TO');
                    setCertRecipientName('Marceline Anderson');
                    setCertDescription('For outstanding academic performance, exemplary character, and unparalleled commitment to educational excellence in the honors program of senior study.');
                    setCertLeftSignerTitle('Head of Event');
                    setCertLeftSignerName('Dr. Arshdeep Singh');
                    setCertRightSignerTitle('Mentor');
                    setCertRightSignerName('Prof. Anita Sen');
                    setCertDate('June 17, 2026');
                    setCertBorderColor('#3E4B57');
                    setCertHasTexture(true);
                  }}
                  className="w-full border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[10px] uppercase font-bold tracking-widest py-2 rounded-xl transition cursor-pointer"
                >
                  Reset Form to Defaults
                </button>
              </div>
            </div>

            {/* Canvas Preview Case */}
            <div className="lg:col-span-8 space-y-3">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>⚡ Interactive Real-time WYSIWYG Canvas:</span>
                </div>
                <span className="text-[9px] text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">Aspect Ratio 1.414 (A4 Landscape)</span>
              </div>

              {/* Certificate Frame Enclosure container */}
              <div className="bg-slate-100 hover:bg-slate-205 aspect-[1.414/1] p-3 sm:p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden group transition">
                {/* The Live interactive Canvas */}
                <canvas
                  id="certificate_live_canvas"
                  className="w-full h-full rounded-2xl shadow-2xl border border-slate-300 bg-[#F4F2EE] transition-all duration-300 select-none"
                />
              </div>

              <div className="bg-blue-50/50 border border-blue-150 text-[10.5px] leading-relaxed text-blue-800 rounded-2xl p-4 flex items-start space-x-2.5 font-medium shadow-sm">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">High Fidelity Rendering Engine:</span>
                  The preview container renders a high-definition pixel-perfect canvas. Double vintage ornate frames, handcrafted corner baroque curves, custom serif header text, and simulated script signatures are printed smoothly.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. Doubt Session Centre & Entrance Clearance Board */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'doubts' && (
        <div className="space-y-6" id="teacher_doubts_panel">
          {/* Header Dashboard section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Doubt Session Centre & Entrance Clearance Board</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure physical class bulletins for weekends or public holidays, audit student petitions, verify attachments and clear students for entry.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-center">
                <span className="block text-[10px] text-indigo-500 font-mono font-bold uppercase tracking-wider">Active Bulletins</span>
                <span className="text-lg font-extrabold text-indigo-900 font-mono">{doubtReminders.length}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl text-center animate-pulse">
                <span className="block text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">Pending Passes</span>
                <span className="text-lg font-extrabold text-amber-900 font-mono">
                  {doubtSubmissions.filter(s => s.status === 'pending').length}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-center">
                <span className="block text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider">Cleared Entries</span>
                <span className="text-lg font-extrabold text-emerald-950 font-mono">
                  {doubtSubmissions.filter(s => s.status === 'approved').length}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. SCHEDULE BULLETIN CREATOR */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Create Weekly Doubt Class</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                    Seminar/Doubt Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT-JEE Mechanics Sunday Masterclass"
                    value={doubtFormTitle}
                    onChange={(e) => setDoubtFormTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-sans text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                      Subject
                    </label>
                    <select
                      value={doubtFormSubject}
                      onChange={(e) => setDoubtFormSubject(e.target.value as Subject)}
                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-slate-700"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                      Target Grade
                    </label>
                    <select
                      value={doubtFormClass}
                      onChange={(e) => setDoubtFormClass(e.target.value as ClassGrade | 'All Classes')}
                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-slate-700"
                    >
                      <option value="All Classes">All Classes</option>
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
                      <option value="IIT-JEE">IIT-JEE</option>
                      <option value="NEET">NEET Coaching</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                    Class Days (Multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Saturday', 'Sunday', 'Special Holiday'].map((day) => {
                      const dayTyped = day as any;
                      const isSelected = doubtFormDays.includes(dayTyped);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setDoubtFormDays(prev => prev.filter(d => d !== dayTyped));
                            } else {
                              setDoubtFormDays(prev => [...prev, dayTyped]);
                            }
                          }}
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {doubtFormDays.includes('Special Holiday') && (
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-wider font-mono">
                      Special Holiday Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dussehra Festival Break class"
                      value={doubtHolidayName}
                      onChange={(e) => setDoubtHolidayName(e.target.value)}
                      className="w-full border border-indigo-150 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-sans text-slate-700"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                    Venue Address / Physical Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physics Lab, Ground Floor, Science Block"
                    value={doubtFormAddress}
                    onChange={(e) => setDoubtFormAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-sans text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                    Instructions & Guidelines for Students
                  </label>
                  <textarea
                    placeholder="Describe chapters covered, specific sheets to carry..."
                    value={doubtFormDesc}
                    onChange={(e) => setDoubtFormDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-sans text-slate-700 h-20 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!doubtFormTitle.trim() || !doubtFormAddress.trim()) {
                      alert('Please fill out the Title and Address locations.');
                      return;
                    }
                    if (doubtFormDays.length === 0) {
                      alert('Please select at least one day (Saturday/Sunday/Holiday) for the class.');
                      return;
                    }

                    const newRem: any = {
                      id: 'rem_' + Math.random().toString(36).substring(2, 9),
                      title: doubtFormTitle,
                      subject: doubtFormSubject,
                      classGroup: doubtFormClass,
                      daysOfWeek: doubtFormDays,
                      holidayName: doubtFormDays.includes('Special Holiday') ? doubtHolidayName : undefined,
                      offlineAddress: doubtFormAddress,
                      description: doubtFormDesc,
                      createdAt: new Date().toISOString()
                    };

                    onSetDoubtReminders(prev => [newRem, ...prev]);
                    
                    // Reset fields
                    setDoubtFormTitle('');
                    setDoubtHolidayName('');
                    setDoubtFormAddress('');
                    setDoubtFormDesc('');
                    alert('Doubt Class reminder notice published to students successfully!');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition tracking-wide uppercase shadow"
                >
                  Publish Class Notice to Board
                </button>
              </div>
            </div>

            {/* 2. BULLETIN REPOSITORY */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Active Doubt Bulletins</span>
                <span className="text-[10px] text-indigo-500 font-mono font-bold">
                  {doubtReminders.length} notices
                </span>
              </h3>

              {doubtReminders.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 flex flex-col items-center justify-center">
                  <Calendar className="w-10 h-10 text-slate-300 mb-2" />
                  <span className="text-xs font-bold font-mono">No Active Classes Published</span>
                  <p className="text-[10px] text-slate-400 mt-1">Use the left board to schedule weekend/holiday study classes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                  {doubtReminders.map((rem) => (
                    <div key={rem.id} className="border border-slate-150 p-4 rounded-2xl bg-slate-50/50 space-y-3 relative hover:border-slate-300 transition">
                      <button
                        type="button"
                        onClick={() => {
                          onSetDoubtReminders(prev => prev.filter(r => r.id !== rem.id));
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition"
                        title="Remove Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-indigo-50 text-indigo-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                            {rem.subject}
                          </span>
                          <span className="bg-slate-200 text-slate-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                            {rem.classGroup}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">{rem.title}</h4>
                        {rem.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {rem.description}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-2 text-[9px] font-mono text-slate-500 space-y-1">
                        <div className="text-indigo-600 font-bold uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>Days: {rem.daysOfWeek.join(' + ')}</span>
                        </div>
                        {rem.holidayName && (
                          <div className="text-red-500 font-bold uppercase">
                            Holiday: {rem.holidayName}
                          </div>
                        )}
                        <div className="text-slate-700 leading-normal font-sans text-[10px] pt-1">
                          Offline Venue: <strong className="text-slate-900">{rem.offlineAddress}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 3. STUDENT ENTRANCE TICKET PETITIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Student Attendance clearances & tickets</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Review student assignments, text queries, check screenshot files, and confirm desk allocations with entry codes.
                </p>
              </div>

              <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono uppercase text-slate-600">
                Pending approval: <strong className="text-indigo-600">
                  {doubtSubmissions.filter(s => s.status === 'pending').length} requests
                </strong>
              </div>
            </div>

            {doubtSubmissions.length === 0 ? (
              <p className="text-center font-mono text-xs text-slate-400 py-12">No requests currently on record</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doubtSubmissions.map((sub) => {
                  const isSelected = activeSubId === sub.id;
                  const statusBg = 
                    sub.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' 
                      : sub.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';

                  return (
                    <div key={sub.id} className={`bg-slate-50/50 border rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition ${
                      isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/5' : 'border-slate-150'
                    }`}>
                      
                      <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <strong className="text-slate-800 text-xs font-bold uppercase block">{sub.studentName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.studentClass} • {sub.chapter}</span>
                        </div>
                        <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${statusBg}`}>
                          {sub.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold tracking-wider block font-mono uppercase mb-0.5">Student Problem statement:</span>
                          <span className="text-slate-850">{sub.doubtDescription}</span>
                        </div>

                        {sub.doubtImageBase64 ? (
                          <div className="pt-1.5">
                            <span className="text-[9px] text-slate-400 font-bold block font-mono uppercase mb-1">Attached Snapshot of Doubt (Click to zoom):</span>
                            <div 
                              onClick={() => setActiveZoomImage(sub.doubtImageBase64 || null)}
                              className="w-40 h-24 rounded-lg border border-slate-200 overflow-hidden relative cursor-zoom-in group bg-slate-100 shadow-sm transition active:scale-95"
                            >
                              <img 
                                src={sub.doubtImageBase64} 
                                alt="Doubt screenshot" 
                                className="w-full h-full object-cover group-hover:scale-105 transition" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-[8px] bg-indigo-600 text-white font-mono uppercase px-1.5 py-0.5 rounded font-black">ZOOM OUT</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400 font-mono italic">[No Screenshot Uploaded / Pure description text]</p>
                        )}
                      </div>

                      <div className="bg-slate-150/40 p-2.5 rounded-xl font-mono text-[10px] text-slate-500 space-y-1">
                        <div className="text-indigo-600 font-bold">Planned Day: {sub.doubtDayType} ({sub.scheduledTimeSlot})</div>
                        <div>Logged: {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                        
                        {sub.status === 'approved' && (
                          <div className="pt-2 border-t border-slate-100 mt-2 space-y-1 text-emerald-700">
                            <div className="font-sans">
                              Entry Code: <strong className="text-emerald-950 bg-emerald-100 border border-emerald-200 select-all font-mono px-1.5 py-0.5 rounded tracking-wide font-extrabold">{sub.entryGrantCode}</strong>
                            </div>
                            <div>Desk Station: <strong className="text-slate-800 font-sans">{sub.offlineLocationDetails}</strong></div>
                            {sub.teacherNotes && <div className="text-[9.5px] italic text-slate-500 font-sans leading-relaxed">Instructor instructions: "{sub.teacherNotes}"</div>}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 items-center flex-wrap pt-1.5 border-t border-slate-100">
                        {sub.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSubId(sub.id);
                                setTeacherCustomLoc(sub.offlineLocationDetails || '');
                                setTeacherAdviceNotes(sub.teacherNotes || '');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9.5px] tracking-wider uppercase px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              ✓ Approve Clearance
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSetDoubtSubmissions(prev => prev.map(item => {
                                  if (item.id === sub.id) {
                                    return { ...item, status: 'rejected' };
                                  }
                                  return item;
                                }));
                              }}
                              className="bg-[#FFEBEB] hover:bg-rose-100 border border-rose-200 text-rose-600 text-[9.5px] font-bold tracking-wider uppercase px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              Reject request
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono uppercase">
                            <span>CLEARANCE COMPLETED</span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSubId(sub.id);
                                setTeacherCustomLoc(sub.offlineLocationDetails || '');
                                setTeacherAdviceNotes(sub.teacherNotes || '');
                              }}
                              className="text-indigo-600 hover:underline cursor-pointer"
                            >
                              [Edit station params]
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => {
                                onSetDoubtSubmissions(prev => prev.filter(s => s.id !== sub.id));
                              }}
                              className="text-rose-605 hover:underline font-mono cursor-pointer"
                            >
                              Purge Record
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => exportTicketToPDF(sub)}
                              className="text-emerald-600 hover:underline font-sans font-bold flex items-center gap-0.5"
                              title="Export student admission pass to PDF"
                            >
                              <Download className="w-2.5 h-2.5 text-emerald-400" />
                              PDF PASS
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Clearance parameters modal settings panel */}
                      {isSelected && (
                        <div className="p-4 bg-slate-100 border-t-2 border-slate-300 rounded-xl space-y-3 mt-2 font-mono text-[10px] text-left animate-fade-in">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                            <span className="text-slate-800 uppercase font-bold tracking-wider text-[9px]">Entry Allowance Configuration</span>
                            <button type="button" onClick={() => setActiveSubId(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-slate-500 uppercase text-[8px] mb-0.5">Mandatory Entry Desk Location Details:</label>
                            <input
                              type="text"
                              value={teacherCustomLoc}
                              onChange={(e) => setTeacherCustomLoc(e.target.value)}
                              placeholder="e.g. Physics Lab, Lab Table #4, Block B Ground Floor"
                              className="w-full border border-slate-300 bg-white p-2 rounded text-xs text-slate-850 focus:border-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 uppercase text-[8px] mb-0.5">Class Advisory / Instructor Notes:</label>
                            <input
                              type="text"
                              value={teacherAdviceNotes}
                              onChange={(e) => setTeacherAdviceNotes(e.target.value)}
                              placeholder="Bring class handbook, scientific calculator..."
                              className="w-full border border-slate-300 bg-white p-2 rounded text-xs text-slate-850 focus:border-indigo-500 outline-none"
                            />
                          </div>

                          <div className="flex gap-2 pt-1 font-sans">
                            <button
                              type="button"
                              onClick={() => {
                                if (!teacherCustomLoc.trim()) {
                                  alert('Point coordinates / offline table allocation address is mandatory for granting gateway passes!');
                                  return;
                                }

                                const randCode = 'DUB-' + Math.floor(1000 + Math.random() * 9000);
                                onSetDoubtSubmissions(prev => prev.map(item => {
                                  if (item.id === sub.id) {
                                    return { 
                                      ...item, 
                                      status: 'approved',
                                      entryGrantCode: randCode,
                                      offlineLocationDetails: teacherCustomLoc,
                                      teacherNotes: teacherAdviceNotes
                                    };
                                  }
                                  return item;
                                }));
                                setActiveSubId(null);
                                alert(`Gateway clearance given! Ticket code: ${randCode}. Location: ${teacherCustomLoc}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-[9px] font-black tracking-wider py-2 px-3 rounded-lg transition shrink-0"
                            >
                              Confirm entrance authorization
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSubId(null)}
                              className="bg-slate-300 text-slate-700 hover:bg-slate-400 uppercase text-[9px] py-2 px-2.5 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ZOOM SCREEN VIEWER FOR TEACHER */}
          {activeZoomImage && (
            <div 
              className="fixed inset-0 bg-slate-905/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out"
              onClick={() => setActiveZoomImage(null)}
            >
              <div 
                className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 max-w-2xl w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActiveZoomImage(null)}
                  className="absolute -top-12 right-0 text-white bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-705 hover:bg-indigo-600 transition flex items-center gap-1 text-[10px] font-mono shadow-md"
                >
                  <X className="w-4 h-4" /> CLOSE PREVIEW
                </button>
                <img 
                  src={activeZoomImage} 
                  alt="Full-size student physics doubt layout screenshot snapshot" 
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto bg-slate-150 border rounded-2xl shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <p className="text-center font-mono text-[9px] text-slate-400 mt-3 uppercase tracking-widest font-black">
                  Student Snapshot Verification Portal — Doubt Screen Audit Canvas
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Floating PDF Viewer Modal for Teachers */}
      <AnimatePresence>
        {viewerPDF && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setViewerPDF(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 text-slate-800 flex flex-col max-h-[90vh] overflow-hidden my-auto"
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="text-xs font-bold uppercase text-slate-800 truncate">{viewerPDF.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase truncate">File: {viewerPDF.pdfName || "document.pdf"} ({viewerPDF.subject})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewerPDF(null)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-500 transition rounded-xl flex items-center justify-center cursor-pointer"
                    title="Close preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dual Mode Switcher Tabs */}
              {(viewerPDF.pdfUrl || viewerPDF.pdfName) && (
                <div className="flex border-b border-slate-100 mb-4 space-x-1">
                  <button
                    type="button"
                    onClick={() => setViewerMode('pdf')}
                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                      viewerMode === 'pdf'
                        ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    📄 Live Document Preview (Read-Only)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerMode('text')}
                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                      viewerMode === 'text'
                        ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    📝 Parsed Text Reader
                  </button>
                </div>
              )}

              {/* Main Content View - Native Iframe PDF Viewer with Local Text Fallback */}
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {(viewerPDF.pdfUrl || viewerPDF.pdfName) && viewerMode === 'pdf' ? (
                  <div className="space-y-3">
                    <PdfCanvasViewer 
                      pdfUrl={viewerPDF.pdfUrl}
                      pdfName={viewerPDF.pdfName || "document.pdf"}
                      pdfText={viewerPDF.pdfText}
                      theme="light"
                    />
                    {viewerPDF.pdfUrl && (
                      <div className="flex justify-start">
                        <a
                          href={`/api/pdf/view/${viewerPDF.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-500 hover:underline transition font-mono cursor-pointer"
                        >
                          ⚠️ Open PDF asset in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-h-[550px] overflow-y-auto leading-relaxed">
                    <p className="text-[10px] text-slate-400 font-mono uppercase mb-3 border-b border-slate-100 pb-2">
                      Parsed Document Text Content ({viewerPDF.pdfName || "document.pdf"}):
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed select-text">
                      {viewerPDF.pdfText || "No readable plain-text contents attached to this assignment sheet."}
                    </pre>
                  </div>
                )}
              </div>

              {/* Document footer bar */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>PREVIEW QUALITY: NATIVE HIGH FIDELITY</span>
                </div>
                <div className="uppercase">
                  Target: <span className="font-bold text-blue-600">{viewerPDF.targetClass}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
