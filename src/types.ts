/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'Science' | 'English' | 'Hindi' | 'Social Science' | 'Sanskrit' | 'Urdu' | 'Health and Physical Education' | 'Accounts' | 'Business' | 'Economic' | 'Mental Ability' | 'Commerce';

export type ClassGrade = 
  | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' 
  | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' 
  | 'Class 11' | 'Class 12' | 'IIT-JEE' | 'NEET';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  targetClass: ClassGrade;
  questions: Question[];
  createdAt: string;
  deadline?: string;
  autoDeleteAfterDeadline?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: Subject;
  targetClass: ClassGrade;
  pdfUrl?: string; // or mock pdf visualization
  pdfName?: string;
  pdfText?: string; // stores text content extracted or simulated
  description: string;
  dueDate: string;
  points: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  testId?: string; // If submitted for a secure written test instead of assignment
  studentId: string;
  studentName: string;
  submittedFile?: string; // filename or mock file
  submittedPdfUrl?: string; // Web PDF base64 file data
  studentNotes: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  grade?: {
    score: number;
    feedback: string;
    gradedAt: string;
    points: number;
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  timeSpentMs: number; // to rank top performers on time
  completedAt: string;
}

export interface Student {
  id: string;
  name: string;
  enrolledClass: ClassGrade;
  avatar: string;
  email: string;
  accessCode: string;
  paymentStatus?: 'unpaid' | 'pending_approval' | 'approved';
  paymentAmount?: number;
  paymentTxRef?: string;
  studentIdCardNumber?: string; // e.g. ESB/2024/12/0045
  courseName?: string; // e.g. "ANVI-24" inside BOARDS + FOUNDATION
  walletBalance?: number; // e.g. 1500 Coins
  active?: boolean; // active/nonactive
  studentPhoto?: string; // base64 uploaded photo
  loginTimestamp?: string; // ISODate when student logged in (for 3-month expiry)
  registrationType?: 'regular' | 'abhedya_gurukul';
  gurukulFacility?: string; // School or Mandir Name for Abhedya Gurukul Scholars
  stream?: 'Science' | 'Commerce' | 'Arts';
  contactNumber?: string;
  residenceAddress?: string;
  dateOfJoining?: string;
}

export interface ChapterMaterial {
  id: string;
  subject: Subject; 
  chapterId: string; // e.g. "CH-1"
  chapterName: string; // e.g. "Relations and Functions"
  materialType: 'booklet' | 'video' | 'test' | 'ncert' | 'question_bank' | 'revision_notes' | 'mlc';
  subType?: 'theory' | 'examples' | 'pyq' | 'practice' | 'dpp' | 'revision_schedule_1' | 'revision_schedule_2' | 'part_test' | 'half_syllabus_test' | 'full_syllabus_test' | 'weekly_test' | 'chapter_test' | 'half_yearly_test' | 'yearly_test';
  title: string;
  content: string; // narrative text or list of items
  fileUrl?: string; // pdf or mock document
  videoUrl?: string; // simulated stream video url or mock
  targetClass?: ClassGrade; // class-wise target segment
  authorTeacher?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: Subject;
  credential: string;
  email: string;
}

export interface LiveClass {
  id: string;
  title: string;
  subject: Subject;
  targetClass: ClassGrade;
  teacherId: string;
  teacherName: string;
  scheduledAt: string;
  isLive: boolean;
  whiteboardData?: string; // canvas drawings
  currentSlide?: number;
  meetLink?: string;
}

export interface Message {
  id: string;
  senderName: string;
  text: string;
  role: 'teacher' | 'student';
  timestamp: string;
}

export interface CountdownTimerConfig {
  title: string;
  targetDateTime: string;
  type: 'live_class' | 'assignment' | 'custom';
  targetId?: string;
  isActive: boolean;
}

export interface DoubtSessionReminder {
  id: string;
  title: string;
  subject: Subject;
  classGroup: ClassGrade | 'All Classes';
  daysOfWeek: ('Saturday' | 'Sunday' | 'Special Holiday')[];
  holidayName?: string;
  createdAt: string;
  offlineAddress: string;
  description?: string;
  reminderStatus: 'active' | 'completed';
}

export interface StudentDoubtSubmission {
  id: string;
  reminderId?: string;
  studentId?: string;
  studentName: string;
  className?: ClassGrade;
  studentClass?: ClassGrade;
  chapter: string;
  preferredTime?: string; // restricted to 8:00 AM to 6:00 PM
  scheduledTimeSlot?: string;
  doubtDay?: 'Saturday' | 'Sunday' | 'Special Holiday';
  doubtDayType?: 'Saturday' | 'Sunday' | 'Special Holiday';
  doubtImage?: string; // base64 / mock
  doubtImageBase64?: string;
  doubtText?: string;
  doubtDescription?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  entryGrantCode?: string;
  teacherNotes?: string;
  offlineLocationDetails?: string;
}


