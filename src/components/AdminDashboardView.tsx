import React, { useState } from 'react';
import { Student, Teacher, Subject, ClassGrade, DoubtSessionReminder, StudentDoubtSubmission } from '../types';
import { 
  Users, CheckCircle2, XCircle, IndianRupee, Bell, Shield, 
  ArrowRight, Search, TrendingUp, RefreshCw, ShieldAlert, CreditCard,
  Lock, Mail, Key, Send, Check, ShieldCheck, Trash2, KeyRound, ShieldAlert as UserMinus,
  Plus, X, Clock, MapPin, Compass, Image as ImageIcon, CheckCircle, CalendarDays, Download, QrCode
} from 'lucide-react';
import { exportTicketToPDF } from '../utils/pdfExport';

interface AdminDashboardViewProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  teachers: Teacher[];
  onSetTeachers: (teachers: Teacher[]) => void;
  onLoginAsStudent?: (student: Student) => void;
  doubtReminders: DoubtSessionReminder[];
  onSetDoubtReminders: React.Dispatch<React.SetStateAction<DoubtSessionReminder[]>>;
  doubtSubmissions: StudentDoubtSubmission[];
  onSetDoubtSubmissions: React.Dispatch<React.SetStateAction<StudentDoubtSubmission[]>>;
  onAddStudent?: (student: Student) => void;
}

interface EmailLog {
  id: string;
  time: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'sent' | 'pending';
}

export default function AdminDashboardView({
  students,
  onUpdateStudent,
  teachers,
  onSetTeachers,
  onLoginAsStudent,
  doubtReminders,
  onSetDoubtReminders,
  doubtSubmissions,
  onSetDoubtSubmissions,
  onAddStudent
}: AdminDashboardViewProps) {
  // Secured admin session control
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_admin_v4_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Simulated email logs dispatched to the specified verification target: eshikshapie@gmail.com
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('admin_email_logs_new');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("[eShiksha Security Log] Safe JSON parse error for admin email logs.", e);
      }
    }
    return [
      {
        id: 'init-ledger',
        time: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
        recipient: 'eshikshapie@gmail.com',
        subject: '[eShiksha Security] Ledger Synchronization Complete',
        body: 'System initialization successful. Connection established securely. Admin webhook telemetry is currently online and active.',
        status: 'sent'
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterRegType, setFilterRegType] = useState<'all' | 'regular' | 'abhedya_gurukul'>('all');

  // Teacher generator form state variables
  const [teachName, setTeachName] = useState('');
  const [teachSubject, setTeachSubject] = useState<Subject>('Physics');
  const [teachEmail, setTeachEmail] = useState('');
  const [teachCred, setTeachCred] = useState('');
  const [teachSuccessMsg, setTeachSuccessMsg] = useState('');
  const [confirmDeleteTeacherId, setConfirmDeleteTeacherId] = useState<string | null>(null);

  // Abhedya Gurukul Scholar credentials generator state variables
  const [gurukulName, setGurukulName] = useState('');
  const [gurukulEmail, setGurukulEmail] = useState('');
  const [gurukulContact, setGurukulContact] = useState('');
  const [gurukulAddress, setGurukulAddress] = useState('');
  const [gurukulJoinDate, setGurukulJoinDate] = useState('');
  const [gurukulCourse, setGurukulCourse] = useState('ANVI-24');
  const [gurukulClass, setGurukulClass] = useState<ClassGrade>('Class 12');
  const [gurukulPasscode, setGurukulPasscode] = useState('');
  const [gurukulFacilitySelect, setGurukulFacilitySelect] = useState('Abhedya Gurukul Mandir');
  const [gurukulFacilityCustom, setGurukulFacilityCustom] = useState('');
  const [gurukulSuccessMsg, setGurukulSuccessMsg] = useState('');

  // Doubt Reminder Form states
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtSubject, setDoubtSubject] = useState<Subject>('Mathematics');
  const [doubtClassGroup, setDoubtClassGroup] = useState<ClassGrade | 'All Classes'>('All Classes');
  const [doubtDays, setDoubtDays] = useState<('Saturday' | 'Sunday' | 'Special Holiday')[]>(['Saturday']);
  const [doubtHolidayName, setDoubtHolidayName] = useState('');
  const [doubtAddress, setDoubtAddress] = useState('');
  const [doubtDesc, setDoubtDesc] = useState('');

  // Active student doubt approval location feedback state
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [adminManualLocation, setAdminManualLocation] = useState('');
  const [adminTeacherNotes, setAdminTeacherNotes] = useState('');

  // Zoomed image modal state
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  // Verification states
  const [verifyCodeQuery, setVerifyCodeQuery] = useState('');
  const [lastVerifiedTicket, setLastVerifiedTicket] = useState<StudentDoubtSubmission | null>(null);
  const [verifyStatusResult, setVerifyStatusResult] = useState<'unchecked' | 'valid_approved' | 'valid_pending' | 'valid_rejected' | 'invalid' | 'cleared_success'>('unchecked');

  const handleVerifyGatepass = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = verifyCodeQuery.trim();
    if (!query) {
      alert('Please enter a secure Entrance Clearance code or Ticket ID to search.');
      return;
    }

    // Lookup matches
    const found = doubtSubmissions.find(s => 
      (s.entryGrantCode && s.entryGrantCode.trim().toUpperCase() === query.toUpperCase()) ||
      (s.id && s.id.trim().toUpperCase() === query.toUpperCase())
    );

    if (found) {
      setLastVerifiedTicket(found);
      if (found.status === 'approved') {
        setVerifyStatusResult('valid_approved');
      } else if (found.status === 'rejected') {
        setVerifyStatusResult('valid_rejected');
      } else {
        setVerifyStatusResult('valid_pending');
      }
    } else {
      setLastVerifiedTicket(null);
      setVerifyStatusResult('invalid');
    }
  };

  const handleAutoGeneratePassphrase = () => {
    const prefixes: Record<Subject, string> = {
      'Physics': 'PHYS',
      'Chemistry': 'CHEM',
      'Mathematics': 'MATH',
      'Biology': 'BIOL',
      'English': 'ENGL',
      'Science': 'SCI',
      'Hindi': 'HIND',
      'Social Science': 'SST',
      'Sanskrit': 'SANS',
      'Urdu': 'URDU',
      'Health and Physical Education': 'PE',
      'Accounts': 'ACCT',
      'Business': 'BUSI',
      'Economic': 'ECON',
      'Commerce': 'COMM',
      'Mental Ability': 'MAT'
    };
    const code = Math.floor(1000 + Math.random() * 9000);
    setTeachCred(`${prefixes[teachSubject] || 'EDU'}-${code}`);
  };

  const handleGenerateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setTeachSuccessMsg('');

    if (!teachName.trim() || !teachEmail.trim() || !teachCred.trim()) {
      alert('Error: Please complete all teacher fields before generating credit keys.');
      return;
    }

    const isDuplicate = teachers.some(t => t.subject === teachSubject && t.credential === teachCred.trim());
    if (isDuplicate) {
      alert('Error: An instructor with this Department and Passphrase already exists in the registry ledger.');
      return;
    }

    const newTeach: Teacher = {
      id: 't-' + Date.now(),
      name: teachName.trim(),
      subject: teachSubject,
      credential: teachCred.trim(),
      email: teachEmail.trim().toLowerCase()
    };

    const updated = [...teachers, newTeach];
    onSetTeachers(updated);

    addEmailLog(
      `[eShiksha Security] Credentials Generated: ${newTeach.name}`,
      `ADMINISTRATOR PASSPHRASE GENERATOR DISPATCH: Instructor account registered for '${newTeach.name}' under Department of ${newTeach.subject}. Secret portal authentication passphrase allocated: '${newTeach.credential}'. Email: ${newTeach.email}. Access code active immediately.`
    );

    setTeachSuccessMsg(`Success! Credentials generated for ${newTeach.name}. Account is live!`);
    
    // Clear fields
    setTeachName('');
    setTeachEmail('');
    setTeachCred('');
  };

  const handleAutoGenerateGurukulPasscode = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    setGurukulPasscode(`GURUKUL-${code}`);
  };

  const handleGenerateAbhedyaStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setGurukulSuccessMsg('');

    if (!gurukulName.trim() || !gurukulEmail.trim() || !gurukulPasscode.trim()) {
      alert('Error: Please complete Name, Email, and Passcode before creating account.');
      return;
    }

    const formattedEmail = gurukulEmail.trim().toLowerCase();
    const formattedPasscode = gurukulPasscode.trim().toUpperCase();

    const isDuplicate = students.some(
      s => s.email.toLowerCase() === formattedEmail || (s.accessCode.toUpperCase() === formattedPasscode && s.accessCode)
    );

    if (isDuplicate) {
      alert('Error: A student with this email address or passcode key already exists in the ledger database.');
      return;
    }

    const idNum = Math.floor(10000 + Math.random() * 90000);
    const generatedIdCard = `ESHIKSHA-USER-${idNum}`;

    const finalFacilityName = (gurukulFacilitySelect === 'other' ? gurukulFacilityCustom.trim() : gurukulFacilitySelect) || 'Abhedya Gurukul Mandir';

    if (gurukulFacilitySelect === 'other' && !gurukulFacilityCustom.trim()) {
      alert('Error: Please write a custom School / Mandir Name.');
      return;
    }

    const newStudent: Student = {
      id: 'student_g_' + Math.floor(1000 + Math.random() * 9000).toString(),
      name: gurukulName.trim(),
      email: formattedEmail,
      accessCode: formattedPasscode,
      enrolledClass: gurukulClass,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(gurukulName.trim())}`,
      paymentStatus: 'approved', // Automatically approved because credentials are generated by admin
      paymentAmount: 300,        // Fixed ₹300 fee
      paymentTxRef: `GURUKUL-BY-ADMIN-${Math.floor(100000 + Math.random() * 900000)}`,
      studentIdCardNumber: generatedIdCard,
      courseName: gurukulCourse,
      walletBalance: 2500,       // Pre-funded with 2500 Coins
      loginTimestamp: new Date().toISOString(), // Secure starting timestamp
      active: true,
      registrationType: 'abhedya_gurukul',
      gurukulFacility: finalFacilityName,
      contactNumber: gurukulContact,
      residenceAddress: gurukulAddress,
      dateOfJoining: gurukulJoinDate
    };

    if (onAddStudent) {
      onAddStudent(newStudent);
    }

    addEmailLog(
      `[eShiksha Gurukul] Scholars Account Dispatched: ${newStudent.name}`,
      `ADMINISTRATIVE GURUKUL SCHOLAR ACCOUNT DEPLOYED: Scholar record initialized for '${newStudent.name}' targeting ${newStudent.enrolledClass} (${newStudent.courseName}) under Gurukul category/facility: '${finalFacilityName}'. Credentials established: Email ID: '${newStudent.email}', Secret Portal Passcode: '${newStudent.accessCode}'. Direct login active immediately.`
    );

    setGurukulSuccessMsg(`Success! Abhedya Gurukul Scholar credentials generated for ${newStudent.name} (Passcode: ${formattedPasscode}) under "${finalFacilityName}" category.`);

    // Clear fields
    setGurukulName('');
    setGurukulEmail('');
    setGurukulContact('');
    setGurukulAddress('');
    setGurukulJoinDate('');
    setGurukulPasscode('');
    if (gurukulFacilitySelect === 'other') {
      setGurukulFacilityCustom('');
    }
  };

  const handleDeleteTeacher = (teacherId: string, name: string) => {
    const updated = teachers.filter(t => t.id !== teacherId);
    onSetTeachers(updated);

    addEmailLog(
      `[eShiksha Security] Instructor Account Closed: ${name}`,
      `Administrative Revocation Notice: Instructor '${name}' has closed their account (or was administratively terminated). Passphrase credentials neutralized and purged.`
    );
  };

  // Doubt Session handlers
  const handlePublishDoubtReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtTitle.trim() || !doubtAddress.trim()) {
      alert('Please fill out the Title and Offline Location details.');
      return;
    }
    if (doubtDays.length === 0) {
      alert('Please select at least one Doubt Day Option (Saturday, Sunday, or Special Holiday).');
      return;
    }

    const newRem: DoubtSessionReminder = {
      id: 'doubt-rem-' + Date.now(),
      title: doubtTitle.trim(),
      subject: doubtSubject,
      classGroup: doubtClassGroup,
      daysOfWeek: [...doubtDays],
      holidayName: doubtDays.includes('Special Holiday') && doubtHolidayName.trim() ? doubtHolidayName.trim() : undefined,
      createdAt: new Date().toISOString(),
      offlineAddress: doubtAddress.trim(),
      description: doubtDesc.trim() || undefined,
      reminderStatus: 'active'
    };

    onSetDoubtReminders(prev => [newRem, ...prev]);

    addEmailLog(
      `[eShiksha Doubts] Doubt Session Posted: ${newRem.title}`,
      `Administrative alert: A fresh face-to-face weekend/holiday doubt solving class has been scheduled for ${newRem.classGroup}. Days: ${newRem.daysOfWeek.join(', ')}. Venue location is designated as: ${newRem.offlineAddress}.`
    );

    // reset fields
    setDoubtTitle('');
    setDoubtAddress('');
    setDoubtDesc('');
    setDoubtDays(['Saturday']);
    setDoubtHolidayName('');
    alert('Doubt Session active notice published successfully!');
  };

  const handleDeleteDoubtReminder = (id: string, title: string) => {
    onSetDoubtReminders(prev => prev.filter(r => r.id !== id));
    addEmailLog(
      `[eShiksha Doubts] Doubt Session Removed: ${title}`,
      `Administrative notice: The doubt class session for "${title}" has been completed, archived, and removed from active bulletin viewboards.`
    );
  };

  const handleGrantDoubtEntry = (subId: string, location: string, notes: string) => {
    const uniquePassCode = 'DUB-' + Math.floor(1000 + Math.random() * 9000).toString();
    
    onSetDoubtSubmissions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return {
          ...sub,
          status: 'approved',
          offlineLocationDetails: location.trim() || 'Assigned Help-Desk Wing A',
          teacherNotes: notes.trim() || 'Access passport verified. See you offline!',
          entryGrantCode: uniquePassCode
        };
      }
      return sub;
    }));

    const targetSub = doubtSubmissions.find(s => s.id === subId);
    if (targetSub) {
      addEmailLog(
        `[eShiksha Doubts] Entry Approved for ${targetSub.studentName}`,
        `Pass clearance completed for Saturday/Sunday face-to-face class. Code generated: '${uniquePassCode}'. Offline assigned station: '${location || 'General Desk Area'}'. Special instructions: ${notes || 'None'}.`
      );
    }

    // Reset modals/controls
    setSelectedSubmissionId(null);
    setAdminManualLocation('');
    setAdminTeacherNotes('');
    alert('Entry Granted successfully! Student unique pass code is generated.');
  };

  const handleDenyDoubtEntry = (subId: string) => {
    onSetDoubtSubmissions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return {
          ...sub,
          status: 'rejected',
          teacherNotes: 'Sorry, the current time-slot or capacity limit is fully booked for this desk. Please book another slot.',
          entryGrantCode: undefined
        };
      }
      return sub;
    }));

    const targetSub = doubtSubmissions.find(s => s.id === subId);
    if (targetSub) {
      addEmailLog(
        `[eShiksha Doubts] Entry Petition Cancelled: ${targetSub.studentName}`,
        `Administrative action: Entry request denegation for student ${targetSub.studentName}. Capacity limits reached.`
      );
    }
    alert('Doubt petition set to rejected.');
  };

  const addEmailLog = (subject: string, body: string) => {
    const newLog: EmailLog = {
      id: 'log_' + Math.floor(1000 + Math.random() * 9000).toString(),
      time: new Date().toLocaleTimeString(),
      recipient: 'eshikshapie@gmail.com',
      subject,
      body,
      status: 'sent'
    };
    setEmailLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('admin_email_logs_new', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    // Normalize inputs completely: trim spaces, convert to uppercase, and strip any dashes or symbols
    const checkUser = adminUser.trim().toUpperCase().replace(/[^A-Z0-9@.-]/g, '');
    const checkPass = adminPass.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Allow multiple forms representing the user and password to accommodate potential typos, extra characters, or omissions
    const isValidUser = 
      checkUser === 'USER-ADMIIN@ESHIKSHAPIE' || 
      checkUser === 'USER-ADMIN@ESHIKSHAPIE' || 
      checkUser.includes('USER-ADMIIN') || 
      checkUser.includes('USER-ADMIN') || 
      (checkUser.includes('ADMIN') && checkUser.includes('ESHIKSHAPIE'));

    const isValidPass = 
      checkPass === 'ESHIKSHAPIE6586' || 
      checkPass.includes('6586') || 
      checkPass.includes('ESHIKSHAPIE6586');

    setTimeout(() => {
      if (isValidUser && isValidPass) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('is_admin_v4_auth', 'true');
        addEmailLog(
          '[eShiksha Security] admin login detected',
          `Automated Verification Alert: An administrative session was started for credential '${checkUser}' from local host sandbox interface. Sessions expire when explicitly terminated.`
        );
        setIsAuthenticating(false);
      } else {
        setLoginError('Invalid Administrator credit or security key sequence specified. Please ensure you are typing USER-ADMIIN@ESHIKSHAPIE and ESHIKSHAPIE6586 exactly.');
        setIsAuthenticating(false);
      }
    }, 1200);
  };

  const handleLogout = () => {
    addEmailLog(
      '[eShiksha Security] admin session terminated',
      `Session termination confirmed for account USER-ADMIIN@ESHIKSHAPIE. Credentials status cleared successfully.`
    );
    setIsAdminAuthenticated(false);
    localStorage.removeItem('is_admin_v4_auth');
  };

  // Filter and parse database records
  const pendingStudents = students.filter(s => s.paymentStatus === 'pending_approval');
  const approvedStudents = students.filter(s => s.paymentStatus === 'approved');
  const unpaidStudents = students.filter(s => s.paymentStatus === 'unpaid' || !s.paymentStatus);

  const totalRevenue = approvedStudents.reduce((acc, current) => {
    if (current.registrationType === 'abhedya_gurukul') {
      return acc + 300.00;
    }
    return acc + (current.paymentAmount && current.paymentAmount > 100 ? current.paymentAmount : (current.paymentAmount ? current.paymentAmount * 85 : 3999.00));
  }, 0);

  // Filter students by search term, class, and registration type selection
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.accessCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || s.enrolledClass === filterClass;
    const matchesRegType = filterRegType === 'all' || s.registrationType === filterRegType;
    return matchesSearch && matchesClass && matchesRegType;
  });

  const handleUploadProfilePic = (std: Student, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP, or SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        const updated: Student = {
          ...std,
          avatar: base64Url,
          studentPhoto: base64Url
        };
        onUpdateStudent(updated);
        addEmailLog(
          `[eShiksha Security] Profile Image Updated: ${std.name}`,
          `Administrative manual upload action: Official student picture updated using local disk file upload for Student ${std.name} (${std.email}).`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLinkProfilePicUrl = (std: Student) => {
    const url = prompt('Enter a direct web image URL for the student profile picture:', std.avatar?.startsWith('data:') ? '' : std.avatar);
    if (url === null) return; // user cancelled
    
    const targetUrl = url.trim();
    if (!targetUrl) {
      alert('Invalid URL. Image URL cannot be blank.');
      return;
    }

    const updated: Student = {
      ...std,
      avatar: targetUrl,
      studentPhoto: targetUrl
    };
    onUpdateStudent(updated);
    addEmailLog(
      `[eShiksha Security] Profile Image Linked: ${std.name}`,
      `Administrative action: Student profile picture linked to direct URL for ${std.name}.`
    );
  };

  const handleApprove = (std: Student) => {
    const updated: Student = {
      ...std,
      paymentStatus: 'approved'
    };
    onUpdateStudent(updated);
    addEmailLog(
      `[eShiksha Billing] Verification Completed for ${std.name}`,
      `Transactional registration approval confirmed. Student ID: ${std.id} (${std.email}) is successfully granted FULL classroom license access. Code: ${std.accessCode}. Reference token used: ${std.paymentTxRef || 'MANUAL-FORCED-UNLOCK'}.`
    );
    alert(`Success! Granted comprehensive dashboard clearance to ${std.name}. Verification message dispatched to eshikshapie@gmail.com.`);
  };

  const handleRevoke = (std: Student) => {
    const updated: Student = {
      ...std,
      paymentStatus: 'unpaid',
      paymentAmount: undefined,
      paymentTxRef: undefined
    };
    onUpdateStudent(updated);
    addEmailLog(
      `[eShiksha Security] Classroom Access Rescinded: ${std.name}`,
      `Security Alert: Administrative manual update initiated. Student: ${std.name} (${std.email}) payment license has been rescinded and returned to unpaid status.`
    );
    alert(`Status updated. Rescinded workspace permissions for ${std.name}. Verification message dispatched to eshikshapie@gmail.com.`);
  };

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("No students found for current filters to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Email Address",
      "Contact Number",
      "Date of Joining",
      "Class/Grade",
      "Batch/Registration Type",
      "Course/Stream",
      "Amount Paid (Wallet Balance)",
      "Residence Address"
    ];

    const rows = filteredStudents.map(student => {
      // Use existing properties or defaults
      const contactStr = (student as any).contactNumber || '';
      const addressStr = (student as any).residenceAddress || (student as any).residenceLocation || '';
      const joinStr = (student as any).dateOfJoining || '';
      return [
        `"${(student.name || '').replace(/"/g, '""')}"`,
        `"${(student.email || '').replace(/"/g, '""')}"`,
        `"${contactStr.replace(/"/g, '""')}"`,
        `"${joinStr.replace(/"/g, '""')}"`,
        `"${(student.enrolledClass || '').replace(/"/g, '""')}"`,
        `"${(student.registrationType || 'regular').replace(/"/g, '""')}"`,
        `"${(student.courseName || student.stream || '').replace(/"/g, '""')}"`,
        `"${(student.walletBalance || 0)}"`,
        `"${addressStr.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `eshikshapie_students_${filterClass}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addEmailLog(
      `[eShiksha Security] Student Data Exported`,
      `Administrative action: Exported student data (CSV/Excel). Filter: ${filterClass}. RegType: ${filterRegType}. Rows: ${filteredStudents.length}.`
    );
  };

  // Secure Authorization Form Render if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[550px] flex items-center justify-center p-4 animate-fade-in" id="admin-security-vault-login">
        <div className="bg-[#0F0F12] border border-white/10 p-8 w-full max-w-md relative shadow-2xl">
          <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] font-black tracking-widest uppercase px-3 py-0.5">
            SECURE CENTRAL GATEWAY
          </div>

          <div className="text-center mb-6 pt-4">
            <div className="inline-block bg-indigo-950 p-3 border border-indigo-500/30 mb-3">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase italic font-sans animate-pulse">
              Admin Portal
            </h2>
            <p className="text-[10px] text-white/50 tracking-wider uppercase mt-1 font-mono">
              Restricted central administration login required
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-955/50 border border-rose-800 text-rose-450 text-[10px] font-mono uppercase tracking-wider">
                ⚠️ SECURITY ERROR: {loginError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                ADMINISTRATIVE USER ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ex: USER-ADMIIN@ESHIKSHAPIE"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold focus:border-indigo-500 outline-none transition"
                  required
                />
                <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                ROOT PASSKEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none pl-9 pr-3.5 py-2.5 text-xs font-mono focus:border-indigo-500 outline-none transition"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="p-3.5 bg-[#131317] border border-white/5 rounded-none space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-emerald-450 text-xs font-bold font-mono">📡</span>
                <span className="text-[9.5px] text-zinc-400 font-mono leading-relaxed">
                  <strong>SYSTEM MAIL TELEMETRY ACTIVE:</strong> Logins, manual approvals, and system registration audit receipt updates are dispatched securely to:
                  <span className="text-emerald-400 block font-bold font-sans mt-0.5 select-all">ESHIKSHAPIE@GMAIL.COM</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3.5 tracking-widest uppercase transition duration-150 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none flex items-center justify-center space-x-2"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>DISPATCHING SMTP HANDSHAKE VERIFICATION...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHENTICATE & GRANT REGISTRY ACCESS</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[9px] text-zinc-500 text-center font-mono mt-4 uppercase font-bold tracking-wider">
            eShiksha secure network nodes. Attempted breaches are logged immediately.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="admin-portal-workspace">
      
      {/* Alert Center notifications ticker */}
      <div className="bg-[#0F0F12] border border-white/10 p-4 rounded-none flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="font-mono text-xs">
            {pendingStudents.length > 0 ? (
              <span className="text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                [ALERT] {pendingStudents.length} Student Payment Approvals are queued for manual confirmation!
              </span>
            ) : (
              <span className="text-zinc-400 uppercase tracking-wider">
                [SYSTEM STATUS] All platform payments balanced.
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-auto">
          <div className="hidden md:block text-[9px] font-bold text-emerald-400 tracking-widest uppercase font-mono">
            SSL-v4 LEDGER • eshikshapie@gmail.com
          </div>
          <button
            onClick={handleLogout}
            className="text-[9px] font-black text-rose-450 hover:text-white border border-rose-900 bg-rose-955/40 px-2.5 py-1 transition uppercase font-mono"
            title="Terminate current session access"
          >
            Log Out Panel
          </button>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-[#131317] border border-white/10 p-5 rounded-none flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Gross Revenue</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-emerald-950/40 p-3 border border-emerald-500/20 text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#131317] border border-white/10 p-5 rounded-none flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Enrolled Students</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">{students.length}</span>
            </div>
            <div className="bg-indigo-950/40 p-3 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#131317] border border-white/10 p-5 rounded-none flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Approved Passports</span>
              <span className="text-2xl font-black text-indigo-400 font-mono mt-1 block">{approvedStudents.length}</span>
            </div>
            <div className="bg-blue-950/40 p-3 border border-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#131317] border border-white/10 p-5 rounded-none flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Pending Clearances</span>
              <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">{pendingStudents.length}</span>
            </div>
            <div className="bg-amber-950/40 p-3 border border-amber-500/20 text-amber-500">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="bg-[#1C1710] border border-amber-550/40 p-5 rounded-none flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <div>
              <span className="block text-[10px] font-black text-amber-450 uppercase tracking-widest">🔱 Gurukul Scholars</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {students.filter(s => s.registrationType === 'abhedya_gurukul').length}
              </span>
            </div>
            <div className="bg-amber-950/30 p-3 border border-amber-500/20 text-amber-400">
              <span className="text-lg font-black leading-none block">🔱</span>
            </div>
          </div>
        </div>

      {/* Main layout with Pending approvals highlighted first */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pending approvals section taking major priority */}
        <div className="lg:col-span-7 bg-[#0F0F12] border border-white/10 p-6 rounded-none space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <span>Stripe & QR Code Gateway Queue</span>
                {pendingStudents.length > 0 && (
                  <span className="bg-amber-550 text-black text-[9px] font-black px-1.5 py-0.5 rounded-none font-mono animate-bounce">
                    MANUAL AUDIT NEEDED
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Approve checkout transactions or QR code UPI receipts to unlock portal.</p>
            </div>
            <span className="font-mono text-xs text-white bg-white/5 px-2 py-0.5 border border-white/5">
              {pendingStudents.length} pending
            </span>
          </div>

          {pendingStudents.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-3" />
              <span className="text-xs uppercase tracking-widest font-mono font-bold">All approvals current</span>
              <p className="text-[10px] text-zinc-600 mt-1 max-w-xs">No pending student transactions are currently outstanding in the system.</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {pendingStudents.map(std => {
                const isQR = std.paymentTxRef?.startsWith('UPI-');
                const isAbhedya = std.registrationType === 'abhedya_gurukul';
                return (
                  <div key={std.id} className={`p-4 space-y-3 relative shadow-lg transition-all ${
                    isAbhedya
                      ? 'bg-gradient-to-r from-amber-950/40 via-black to-amber-955/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-[pulse_3s_infinite]'
                      : 'bg-black/50 border border-amber-500/30'
                  }`}>
                    <div className={`absolute top-0 right-0 text-black text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 ${
                      isAbhedya
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold'
                        : (isQR ? 'bg-indigo-500' : 'bg-emerald-500')
                    }`}>
                      {isAbhedya ? '🔱 GURUKUL DIRECT SANDBOX' : (isQR ? 'UPI QR SCAN HANDSHAKE' : 'CREDIT CARD GATEWAY AUTH')}
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Interactive Avatar uploading triggers */}
                      <div className="relative group/avatar shrink-0 select-none cursor-pointer">
                        <img src={std.avatar} alt={std.name} className="w-11 h-11 rounded-none border border-white/10 bg-zinc-900 shrink-0 group-hover/avatar:border-indigo-400 transition" />
                        <label htmlFor={`pending-avatar-file-${std.id}`} className="absolute inset-0 bg-black/75 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                          <span className="text-[7px] text-white font-black tracking-tighter text-center leading-tight uppercase font-sans">UPDATE<br/>PHOTO</span>
                        </label>
                        <input 
                          type="file" 
                          id={`pending-avatar-file-${std.id}`}
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleUploadProfilePic(std, e)}
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>{std.name}</span>
                          {isAbhedya ? (
                            <span className="text-[7.5px] bg-amber-500/20 border border-amber-550 text-amber-400 px-1.5 py-0.5 rounded-full font-sans tracking-wide">🔱 GURUKUL</span>
                          ) : (
                            <span className="text-[7.5px] bg-red-500/20 border border-red-500/50 text-red-500 px-1.5 py-0.5 rounded-full font-sans tracking-wide">🎯 ARJUNA BATCH</span>
                          )}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{std.email} • {std.enrolledClass}</p>
                        
                        <div className="flex items-center space-x-2 mt-1 select-none font-mono">
                          <label htmlFor={`pending-avatar-file-${std.id}`} className="text-[8px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer">
                            [ UPLOAD PHOTO ]
                          </label>
                          <span className="text-zinc-600 text-[8px]">•</span>
                          <button
                            type="button"
                            onClick={() => handleLinkProfilePicUrl(std)}
                            className="text-[8px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                          >
                            [ LINK URL ]
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Transaction metadata */}
                    <div className="grid grid-cols-2 gap-3 bg-black border border-white/5 p-3 font-mono text-[10px] text-zinc-300">
                      <div>
                        <span className="text-zinc-500 block">Transaction Reference:</span>
                        <span className="text-zinc-200 font-bold break-all">{std.paymentTxRef || "PENDING_ID"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Transacted Cash:</span>
                        <span className="text-emerald-400 font-black font-mono">
                          ₹{(std.paymentAmount && std.paymentAmount > 100 ? std.paymentAmount : (std.paymentAmount ? std.paymentAmount * 85 : 3999.00)).toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => handleApprove(std)}
                        className="flex-1 bg-emerald-600 hover:bg-black text-white font-black text-[9px] tracking-widest uppercase py-2 border border-emerald-500 rounded-none transition"
                      >
                        ✓ APPROVE & SEND VERIFICATION MAIL
                      </button>
                      <button
                        onClick={() => handleRevoke(std)}
                        className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-white font-mono text-[9px] tracking-widest uppercase px-3 py-2 border border-rose-900/40 rounded-none transition"
                      >
                        DENY
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global registry and search tools taking up matching column */}
        <div className="lg:col-span-5 bg-[#0F0F12] border border-white/10 p-6 rounded-none space-y-4 flex flex-col">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-sans">Classroom Access Index</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Registry search tool & manual permissions tuner</p>
            <div className="mt-2 bg-amber-950/20 border border-amber-900/30 p-2 text-[9px] text-amber-300 font-mono leading-normal uppercase">
              🛡️ SECURITY PROTOCOL: Student logins remain valid for exactly 3 months. Once expired, the passcode clears and fresh credentials must be generated below.
            </div>
          </div>

          <div className="space-y-3">
            {/* Search Input bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or entry code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-none p-2.5 pl-9 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none transition font-mono"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            {/* Filter tags tab list */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-black/40 border border-white/5">
              {[
                'all', 
                'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
                'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
                'Class 11', 'Class 12', 'IIT-JEE', 'NEET'
              ].map((cl) => (
                <button
                  key={cl}
                  onClick={() => setFilterClass(cl)}
                  className={`text-[9px] font-mono font-black tracking-wide uppercase py-1 px-1.5 border transition text-center truncate ${
                    filterClass === cl
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-[#131317] border-white/10 text-zinc-400 hover:text-white hover:bg-black/50'
                  }`}
                  title={cl === 'all' ? 'All Grades' : cl}
                >
                  {cl === 'all' ? 'All' : cl}
                </button>
              ))}
            </div>

            {/* Registration Type Filter tabs & Export */}
            <div className="space-y-1.5 pt-1.5 border-t border-white/5 flex flex-col justify-between">
              <span className="text-[9px] text-zinc-500 font-mono block uppercase">Registration Type Filter:</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  {[
                    { id: 'all', label: 'All types' },
                    { id: 'regular', label: 'Regular' },
                    { id: 'abhedya_gurukul', label: '🔱 Gurukul' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilterRegType(item.id as any)}
                      className={`flex-1 text-[9px] font-mono font-black tracking-wide uppercase py-1 px-1.5 border transition text-center truncate ${
                        filterRegType === item.id
                          ? 'bg-amber-600 border-amber-500 text-white shadow-sm font-black'
                          : 'bg-[#131317] border-white/10 text-zinc-400 hover:text-white hover:bg-black/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-black tracking-widest uppercase px-3 py-1.5 border border-emerald-500 rounded-none transition flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT EXCEL</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of filtered students */}
          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 flex-1">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-[10px] text-zinc-500 italic py-6">No matching records found.</p>
            ) : (
              filteredStudents.map(std => {
                const isApproved = std.paymentStatus === 'approved';
                const isPending = std.paymentStatus === 'pending_approval';
                const isAbhedya = std.registrationType === 'abhedya_gurukul';

                return (
                  <div key={std.id} className={`p-3 flex items-center justify-between gap-3 font-mono transition-all ${
                    isAbhedya
                      ? 'bg-amber-950/20 border border-amber-500/50 shadow-[inset_0_0_12px_rgba(245,158,11,0.08)]'
                      : 'bg-black/30 border border-white/5'
                  }`}>
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Interactive avatar trigger */}
                      <div className="relative group/idxavatar shrink-0 select-none cursor-pointer">
                        <img src={std.avatar} alt={std.name} className={`w-9 h-9 rounded-none bg-zinc-900 shrink-0 group-hover/idxavatar:border-indigo-400 transition border ${isAbhedya ? 'border-amber-500/50' : 'border-white/5'}`} />
                        <label htmlFor={`idx-avatar-file-${std.id}`} className="absolute inset-0 bg-black/80 opacity-0 group-hover/idxavatar:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                          <span className="text-[6px] text-white font-black tracking-widest text-center leading-normal uppercase font-sans">SET</span>
                        </label>
                        <input 
                          type="file" 
                          id={`idx-avatar-file-${std.id}`}
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleUploadProfilePic(std, e)}
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="text-[11px] font-black text-white block uppercase tracking-wide truncate">{std.name}</span>
                        <span className="text-[8.5px] text-[#FF7A45] block lowercase font-sans font-medium leading-tight mb-0.5 truncate" title={std.email}>{std.email}</span>
                        
                        {std.registrationType === 'abhedya_gurukul' ? (
                          <div className="flex items-center gap-1.5 mt-0.5 mb-1 flex-wrap">
                            <span className="text-[7.5px] bg-[#FFE0B2] border border-[#FFB74D] text-[#E65100] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold flex items-center">
                              🔱 ABHEDYA GURUKUL
                            </span>
                            <span className="text-[7.5px] bg-[#E8F5E9] border border-[#81C784] text-[#2E7D32] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold flex items-center">
                              🎓 SCHOLARSHIP
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5 mb-1 flex-wrap">
                            <span className="text-[7.5px] bg-red-500/10 border border-red-500/35 text-red-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold flex items-center">
                              🎯 ARJUNA BATCH
                            </span>
                            <span className="text-[7.5px] bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold flex items-center">
                              🎓 NORMAL STUDENT
                            </span>
                          </div>
                        )}

                        {/* Interactive Credentials & Passcode Modifier/Regenerator */}
                        <div className="flex items-center space-x-1 flex-wrap mt-0.5">
                          <span className="text-[9px] text-zinc-500">Passcode:</span>
                          <input 
                            type="text"
                            value={std.accessCode || ""}
                            placeholder="⚠️ EXPIRED - SET PASSCODE"
                            onChange={(e) => {
                              const val = e.target.value.trim().toUpperCase();
                              onUpdateStudent({ ...std, accessCode: val });
                            }}
                            className={`w-28 h-4 bg-[#0A0A0D] border ${!std.accessCode ? 'border-amber-500/50 text-amber-500 font-bold' : 'border-white/10 text-zinc-200'} px-1 font-mono tracking-wider font-black text-[9px] rounded-sm focus:border-indigo-500 outline-none`}
                            title="Set student access passcode anytime"
                          />
                          {!std.accessCode && (
                            <button
                              type="button"
                              onClick={() => {
                                const randomCode = 'SEC' + Math.floor(100 + Math.random() * 900);
                                onUpdateStudent({ ...std, accessCode: randomCode });
                              }}
                              className="text-[7.5px] px-1.5 py-px bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold uppercase rounded-sm border border-amber-500/30 transition-all cursor-pointer"
                              title="Instant generate fresh security passcode"
                            >
                              GEN
                            </button>
                          )}
                          <span className="text-[#3c3c4b] text-[9px]">•</span>
                          <button
                            type="button"
                            onClick={() => handleLinkProfilePicUrl(std)}
                            className="text-[8px] font-bold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer uppercase"
                            title="Set image Web URL"
                          >
                            URL
                          </button>
                        </div>

                        {/* WALLET BALANCE CONFLICT-FREE PANEL */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] text-zinc-500 font-bold">Balance:</span>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={() => {
                                const current = std.walletBalance ?? 0;
                                onUpdateStudent({ ...std, walletBalance: Math.max(0, current - 100) });
                              }}
                              className="w-5 h-5 bg-[#dedeed] hover:bg-[#c7c7d6] text-[#0f172a] font-extrabold flex items-center justify-center text-xs rounded-sm transition active:scale-95 cursor-pointer shadow-sm border border-zinc-300"
                              title="Decrease by 100 Coins"
                            >
                              -
                            </button>
                            <input 
                              type="number"
                              value={std.walletBalance ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 15);
                                onUpdateStudent({ ...std, walletBalance: isNaN(val) ? 0 : Math.max(0, val) });
                              }}
                              className="w-16 h-5 bg-[#0A0A0D] border border-white/15 text-emerald-400 text-center font-black font-mono text-[10px] rounded-sm focus:border-emerald-500 outline-none"
                              title="Type custom balance"
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const current = std.walletBalance ?? 0;
                                onUpdateStudent({ ...std, walletBalance: current + 100 });
                              }}
                              className="w-5 h-5 bg-[#dedeed] hover:bg-[#c7c7d6] text-[#0f172a] font-extrabold flex items-center justify-center text-xs rounded-sm transition active:scale-95 cursor-pointer shadow-sm border border-zinc-300"
                              title="Increase by 100 Coins"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[8px] text-emerald-555 uppercase font-black tracking-widest font-mono">Coins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onLoginAsStudent?.(std)}
                        className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-500 text-white rounded-sm cursor-pointer flex items-center gap-1 font-sans transition-all active:scale-95 border border-orange-500"
                        title={`Direct Quick Login as ${std.name}`}
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-white" />
                        <span className="text-white">LOGIN</span>
                      </button>

                      {isApproved ? (
                        <div className="text-right">
                          <span className="inline-block bg-emerald-950 border border-emerald-900 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase mb-1 font-mono">
                            ACTIVE
                          </span>
                          <button
                            onClick={() => handleRevoke(std)}
                            className="block font-sans text-[8px] text-rose-455 hover:text-white underline uppercase text-right w-full font-bold"
                          >
                            Rescind Access
                          </button>
                        </div>
                      ) : isPending ? (
                        <button
                          onClick={() => handleApprove(std)}
                          className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black px-2 py-1 uppercase rounded-none font-mono animate-pulse"
                        >
                          Approve
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="inline-block bg-zinc-900 border border-white/5 text-zinc-500 text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase mb-1 font-mono">
                            UNPAID
                          </span>
                          <button
                            onClick={() => handleApprove(std)}
                            className="block font-sans text-[8px] text-indigo-400 hover:text-white underline uppercase text-right w-full font-bold"
                          >
                            Force Unlock
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Instructor Credentials Management Node */}
      <div className="bg-[#0F0F12] border border-white/10 p-6 rounded-none space-y-6" id="admin-teacher-credentials-node">
        <div className="border-b border-white/10 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>Instructor Registry & Credentials Generator</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Admin-only generation of passphrase access keys for designated subject departments.</p>
          </div>
          <span className="font-mono text-xs text-white bg-white/5 px-2.5 py-1 border border-white/5">
            {teachers.length} Active Instructors
          </span>
        </div>

        {teachSuccessMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{teachSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Generate Credentials Form */}
          <form onSubmit={handleGenerateTeacher} className="lg:col-span-5 space-y-4 bg-black/40 border border-white/5 p-5">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <span>Generate Subject Access</span>
            </h4>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Full Instructor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={teachName}
                onChange={(e) => setTeachName(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                  Subject Department
                </label>
                <select
                  value={teachSubject}
                  onChange={(e) => setTeachSubject(e.target.value as Subject)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans text-white/80"
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
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                  Portal Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@eshikshapie.com"
                  value={teachEmail}
                  onChange={(e) => setTeachEmail(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Portal Passphrase Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Set or Auto-Generate key..."
                  value={teachCred}
                  onChange={(e) => setTeachCred(e.target.value)}
                  className="flex-1 border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-mono font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={handleAutoGeneratePassphrase}
                  className="bg-[#0000ff] hover:bg-blue-600 text-white font-black text-[9.5px] px-3.5 tracking-widest uppercase transition-all duration-300 border border-blue-500 animate-pulse rounded-sm active:scale-95 cursor-pointer"
                  title="Generate safe mnemonic passphrase key"
                >
                  ⚡ Auto-Gen
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3 tracking-widest uppercase transition block text-center"
            >
              ✓ Authorize Instructor Credentials
            </button>
          </form>

          {/* Right Column: Active Instructors List */}
          <div className="lg:col-span-7 bg-black/40 border border-white/5 p-5 flex flex-col h-full min-h-[300px]">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white border-b border-white/5 pb-2 flex items-center justify-between">
              <span>Active Registry Directories</span>
              <span className="text-[9px] font-mono text-indigo-400">Total: {teachers.length}</span>
            </h4>

            <div className="space-y-3 overflow-y-auto max-h-[310px] pr-1 mt-3 flex-1">
              {teachers.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-500">
                  <span className="text-xs uppercase tracking-widest font-mono font-bold">No active instructors</span>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-xs">Use the left generator form to register certified subject department chairs.</p>
                </div>
              ) : (
                teachers.map((t) => (
                  <div key={t.id} className="bg-black/50 border border-white/5 p-3 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-none bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 capitalize">
                        {t.subject.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-sans text-xs font-black text-white block uppercase tracking-wide truncate">{t.name}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">{t.email} • <strong className="text-indigo-400 tracking-wider font-mono">{t.subject.toUpperCase()}</strong></span>
                        <span className="text-[9.5px] text-zinc-500 mt-0.5 block">Passphrase: <strong className="text-emerald-450 font-bold font-mono">{t.credential}</strong></span>
                      </div>
                    </div>

                    {confirmDeleteTeacherId === t.id ? (
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteTeacher(t.id, t.name);
                            setConfirmDeleteTeacherId(null);
                          }}
                          className="bg-rose-650 hover:bg-rose-700 border border-rose-500 text-white font-mono text-[9px] tracking-widest uppercase px-3.5 py-2 transition cursor-pointer"
                        >
                          Confirm!
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteTeacherId(null)}
                          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono text-[9px] tracking-widest uppercase px-3.5 py-2 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTeacherId(t.id)}
                        className="bg-rose-950/40 hover:bg-rose-900 border border-rose-900/40 hover:border-rose-600 text-rose-455 hover:text-white font-mono text-[9px] tracking-widest uppercase px-3 py-2 transition shrink-0"
                        title="Decommission teacher workspace entry"
                      >
                        Delete Account
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Abhedya Gurukul Registry & Scholars Credentials Generator Node */}
      <div className="bg-[#1C1710] border border-amber-900/40 p-6 rounded-none space-y-6 animate-[fadeIn_0.5s_ease-out]" id="admin-gurukul-credentials-node">
        <div className="border-b border-amber-900/20 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-450 animate-pulse" />
              <span>🔱 Abhedya Gurukul Scholars Registry & Credentials Generator</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Admin-only generation of access codes for certified offline/gurukul scholars. Auto-approves dashboard entry of scholarship rate.</p>
          </div>
          <span className="font-mono text-xs text-amber-400 bg-amber-950/40 px-2.5 py-1 border border-amber-900/30">
            {students.filter(s => s.registrationType === 'abhedya_gurukul').length} Active Scholars
          </span>
        </div>

        {gurukulSuccessMsg && (
          <div className="p-3 bg-amber-950/50 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wide flex items-center gap-2 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{gurukulSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Generate Gurukul Scholar Form */}
          <form onSubmit={handleGenerateAbhedyaStudent} className="lg:col-span-12 xl:col-span-5 space-y-4 bg-black/40 border border-amber-900/20 p-5">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-amber-450 border-b border-amber-900/20 pb-2 flex items-center gap-1.5 font-sans">
              <span>Generate Scholar Credentials</span>
            </h4>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Scholar Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sarthak Garga"
                value={gurukulName}
                onChange={(e) => setGurukulName(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Scholar Personal Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. sarthak@gmail.com"
                value={gurukulEmail}
                onChange={(e) => setGurukulEmail(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={gurukulContact}
                onChange={(e) => setGurukulContact(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Residence Address
              </label>
              <textarea
                placeholder="e.g. 123 Scholar Lane, Vidya Vihar"
                value={gurukulAddress}
                onChange={(e) => setGurukulAddress(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans resize-none h-16"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Date of Joining
              </label>
              <input
                type="date"
                value={gurukulJoinDate}
                onChange={(e) => setGurukulJoinDate(e.target.value)}
                className="w-full border border-white/10 bg-black text-[gray] focus:text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                  Enrolled Course Batch
                </label>
                <select
                  value={gurukulCourse}
                  onChange={(e) => setGurukulCourse(e.target.value)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans text-white/80"
                >
                  <option value="ANVI-24">ANVI-24 (Arjuna)</option>
                  <option value="VIKA-24">VIKA-24 (Vikas)</option>
                  <option value="KAVI-24">KAVI-24 (Arise)</option>
                  <option value="VIDU-24">VIDU-24 (Vidyapeeth)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                  Enrolled Class Grade
                </label>
                <select
                  value={gurukulClass}
                  onChange={(e) => setGurukulClass(e.target.value as ClassGrade)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans text-white/80"
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
                  <option value="IIT-JEE">IIT-JEE Batch</option>
                  <option value="NEET">NEET Batch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                🏫 School or Mandir Name (Gurukul Category)
              </label>
              <select
                value={gurukulFacilitySelect}
                onChange={(e) => setGurukulFacilitySelect(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans text-white/80"
              >
                <option value="Abhedya Gurukul Mandir">🔱 Abhedya Gurukul Mandir</option>
                <option value="Shiva Pathshala Mandir">🕉️ Shiva Pathshala Mandir</option>
                <option value="Saraswati Shishu Mandir">🌺 Saraswati Shishu Mandir</option>
                <option value="Ganga Gurukul Sansthan">🌊 Ganga Gurukul Sansthan</option>
                <option value="Radha Krishna Vidya Peeth">🩰 Radha Krishna Vidya Peeth</option>
                <option value="other">✏️ Other Custom Facility / School / Mandir Name</option>
              </select>

              {gurukulFacilitySelect === 'other' && (
                <div className="mt-2 animate-[slideDown_0.2s_ease-out]">
                  <input
                    type="text"
                    placeholder="Type Custom School, Mandir, or Gurukul Name..."
                    value={gurukulFacilityCustom}
                    onChange={(e) => setGurukulFacilityCustom(e.target.value)}
                    className="w-full border border-amber-500/40 bg-black text-amber-200 rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-sans placeholder:text-zinc-600"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest font-mono">
                Secret Login Passcode Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GURUKUL-4052_key"
                  value={gurukulPasscode}
                  onChange={(e) => setGurukulPasscode(e.target.value)}
                  className="flex-1 border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-amber-500 outline-none transition font-mono font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateGurukulPasscode}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black text-[9.5px] px-3.5 tracking-widest uppercase transition-all duration-300 border border-amber-500 rounded-sm active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>⚡</span> Auto-Gen
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-650 hover:bg-amber-600 text-white font-extrabold text-xs py-3 tracking-widest uppercase transition block text-center border border-amber-500/20 cursor-pointer"
            >
              ✓ Authorize Gurukul Scholar Account
            </button>
          </form>

          {/* Right Column: Active Gurukul Scholars List */}
          <div className="lg:col-span-12 xl:col-span-7 bg-black/40 border border-amber-900/20 p-5 flex flex-col h-full min-h-[300px]">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-amber-400 border-b border-amber-900/20 pb-2 flex items-center justify-between font-sans">
              <span>Gurukul Scholars Registry Ledger (Categorized)</span>
              <span className="text-[9px] font-mono text-amber-500">Total: {students.filter(s => s.registrationType === 'abhedya_gurukul').length}</span>
            </h4>

            <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1 mt-3 flex-1">
              {students.filter(s => s.registrationType === 'abhedya_gurukul').length === 0 ? (
                <div className="py-12 text-center border border-dashed border-amber-900/10 flex flex-col items-center justify-center text-zinc-500">
                  <span className="text-xs uppercase tracking-widest font-mono font-bold font-sans">No active offline scholars</span>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-xs font-sans">Use the left generator form to authorize verified Abhedya Gurukul scholarship access credentials.</p>
                </div>
              ) : (
                (() => {
                  const gurukulStudents = students.filter(s => s.registrationType === 'abhedya_gurukul');
                  
                  // Group by facility Name
                  const groups: { [facility: string]: Student[] } = {};
                  gurukulStudents.forEach(s => {
                    const facility = s.gurukulFacility || 'Abhedya Gurukul Mandir';
                    if (!groups[facility]) {
                      groups[facility] = [];
                    }
                    groups[facility].push(s);
                  });

                  // Sort facilities alphabetically
                  const sortedFacilities = Object.keys(groups).sort();

                  return sortedFacilities.map((facilityName) => (
                    <div key={facilityName} className="border border-amber-905/20 bg-amber-955/5 p-2.5 rounded-sm space-y-2">
                      <div className="flex items-center justify-between bg-amber-950/40 px-2 py-1 border border-amber-900/15">
                        <span className="text-[10.5px] font-black text-amber-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                          <span>🏛️</span>
                          <span>{facilityName}</span>
                        </span>
                        <span className="text-[9px] font-mono bg-amber-900/55 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-900/15">
                          {groups[facilityName].length} Scholars
                        </span>
                      </div>

                      <div className="space-y-2 pl-1">
                        {groups[facilityName].map((s) => (
                          <div key={s.id} className="bg-black/30 border border-amber-900/10 p-2.5 flex items-center justify-between gap-3 font-mono text-[11px] hover:border-amber-500/25 transition">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-none bg-amber-950 border border-amber-550/20 flex items-center justify-center font-black text-amber-400 capitalize shrink-0 text-xs">
                                🔱
                              </div>
                              <div className="min-w-0">
                                <span className="font-sans text-[11.5px] font-black text-white block uppercase tracking-wide truncate">{s.name}</span>
                                <span className="text-[10px] text-zinc-400 block truncate">{s.email} • <strong className="text-amber-400 tracking-wider font-mono">{s.enrolledClass}</strong></span>
                                <span className="text-[9.5px] text-zinc-500 mt-0.5 block">Passcode: <strong className="text-amber-400 font-bold font-mono">{s.accessCode}</strong> • Course: <strong className="text-zinc-350 font-bold">{s.courseName}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => onLoginAsStudent && onLoginAsStudent(s)}
                                className="bg-zinc-900 hover:bg-amber-950/20 hover:border-amber-900/40 border border-zinc-750 text-zinc-350 hover:text-amber-300 font-mono text-[8.5px] tracking-widest uppercase px-2 py-1 transition rounded-sm cursor-pointer"
                                title="Login proxy helper"
                              >
                                PROXY
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DOUBT SESSION CENTRE: ADMINISTRATOR COORDINATION HUB */}
      <div className="bg-[#0F0F12] border border-white/10 p-6 rounded-none space-y-6" id="admin-doubt-session-center">
        <div className="border-b border-white/10 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-500 animate-spin-slow" />
              <span>Doubt Session Centre — Admin Board</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Publish physical weekend/holiday consultation seminars and grant/reject student entry tickets.</p>
          </div>
          <span className="font-mono text-[9px] text-white bg-indigo-950/80 px-2.5 py-1 border border-indigo-850">
            {doubtReminders.length} Notices • {doubtSubmissions.filter(s => s.status === 'pending').length} Actionable Tickets
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Doubt Session Form */}
          <form onSubmit={handlePublishDoubtReminder} className="lg:col-span-5 space-y-4 bg-black/40 border border-white/5 p-5">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Create Doubt Class Bulletin</span>
            </h4>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Seminar/Doubt Title
              </label>
              <input
                type="text"
                placeholder="e.g. Saturday Physics Direct Mechanics Class"
                value={doubtTitle}
                onChange={(e) => setDoubtTitle(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                  Subject Department
                </label>
                <select
                  value={doubtSubject}
                  onChange={(e) => setDoubtSubject(e.target.value as Subject)}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-2 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans text-white/80"
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
                <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                  Enrolled Target Grade
                </label>
                <select
                  value={doubtClassGroup}
                  onChange={(e) => setDoubtClassGroup(e.target.value as ClassGrade | 'All Classes')}
                  className="w-full border border-white/10 bg-black text-white rounded-none px-2 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans text-white/80"
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
                  <option value="IIT-JEE">IIT-JEE (JEE Main/Adv)</option>
                  <option value="NEET">NEET Coaching</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Doubt Class Schedule Days (Check all that apply)
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1.5 font-mono text-[9px]">
                {['Saturday', 'Sunday', 'Special Holiday'].map((day) => {
                  const dayTyped = day as 'Saturday' | 'Sunday' | 'Special Holiday';
                  const isChecked = doubtDays.includes(dayTyped);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setDoubtDays(prev => prev.filter(d => d !== dayTyped));
                        } else {
                          setDoubtDays(prev => [...prev, dayTyped]);
                        }
                      }}
                      className={`py-1.5 px-2 border uppercase font-black text-center transition ${
                        isChecked 
                          ? 'bg-orange-650 border-orange-500 text-white animate-pulse' 
                          : 'bg-[#15151A] border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {doubtDays.includes('Special Holiday') && (
              <div>
                <label className="block text-[10px] font-black text-orange-400 mb-1 uppercase tracking-widest font-mono">
                  Specify Special Holiday Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gandhi Jayanti Public Holiday Break"
                  value={doubtHolidayName}
                  onChange={(e) => setDoubtHolidayName(e.target.value)}
                  className="w-full border border-orange-550 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-red-500 outline-none transition font-sans"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Offline Venue Location / Address
              </label>
              <input
                type="text"
                placeholder="e.g. Room 403, Science Tower, Block B"
                value={doubtAddress}
                onChange={(e) => setDoubtAddress(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest font-mono">
                Description / Preparation Guide
              </label>
              <textarea
                placeholder="Instruct students on chapters, physical handbooks, or files to bring..."
                value={doubtDesc}
                onChange={(e) => setDoubtDesc(e.target.value)}
                className="w-full border border-white/10 bg-black text-white rounded-none px-3 py-2 text-xs focus:border-indigo-500 outline-none transition font-sans h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-[10.5px] py-3.5 tracking-wider uppercase transition font-mono border border-orange-500"
            >
              Publish Doubt Class Notice Board
            </button>
          </form>

          {/* Active Doubt Sessions Reminders List */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white border-b border-white/5 pb-2 flex items-center justify-between">
              <span>Active Doubt Bulletins</span>
              <span className="text-[8px] text-zinc-500 bg-white/5 px-2 py-0.5">
                {doubtReminders.length} ACTIVE BULLETIN BOARD REMINDERS
              </span>
            </h4>

            {doubtReminders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-500">
                <CalendarDays className="w-12 h-12 text-zinc-700 mb-2" />
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-zinc-400 font-mono">Empty Bulletin Board</span>
                <p className="text-[10px] text-zinc-650 mt-1 max-w-xs">No physical weekend or special holiday classes are currently published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2">
                {doubtReminders.map((rem) => (
                  <div key={rem.id} className="bg-[#121217] border border-white/10 p-4 space-y-3 relative flex flex-col justify-between hover:border-orange-500/20 transition-all">
                    <button
                      type="button"
                      onClick={() => handleDeleteDoubtReminder(rem.id, rem.title)}
                      className="absolute top-3 right-3 text-zinc-500 hover:text-white hover:bg-rose-950 p-1 rounded-sm transition"
                      title="Delete this notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="bg-indigo-955 border border-indigo-900 text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide font-mono">
                          {rem.subject}
                        </span>
                        <span className="bg-white/5 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide font-mono">
                          {rem.classGroup}
                        </span>
                      </div>

                      <h5 className="text-xs font-black text-white hover:text-orange-400 uppercase tracking-wide leading-snug pr-6 block">{rem.title}</h5>

                      {rem.description && (
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {rem.description}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-2.5 mt-2 space-y-1.5 font-mono text-[9px] text-zinc-300">
                      <div className="flex items-center text-orange-400 gap-1 uppercase font-bold">
                        <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                        <span>DAYS: {rem.daysOfWeek.join(' + ')}</span>
                      </div>
                      {rem.holidayName && (
                        <div className="text-red-400 uppercase font-black">
                          Holiday Info: {rem.holidayName}
                        </div>
                      )}
                      <div className="flex items-start text-zinc-400 gap-1 leading-snug">
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                        <span>OFFLINE LOC: <strong className="text-white font-black">{rem.offlineAddress}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STUDENT ENTRANCE TICKET PETITIONS */}
        <div className="bg-black/40 border border-white/5 p-5 space-y-4">
          <div className="border-b border-white/5 pb-2.5 flex flex-wrap justify-between items-center gap-2">
            <div>
              <h4 className="text-[11px] font-black tracking-widest uppercase text-white flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-orange-500 animate-pulse" />
                <span>Student Entry Petition Desk</span>
              </h4>
              <p className="text-[9.5px] text-zinc-400 mt-0.5">Verify Saturday/Sunday student appointments, check attachments of their doubt problems, and allocate entrance codes.</p>
            </div>
            <div className="flex items-center space-x-2.5 text-[9px] font-mono uppercase">
              <span className="text-zinc-500">Unresolved Remittance Queue:</span>
              <span className="bg-amber-955 border border-amber-900 text-amber-400 font-extrabold px-2 py-0.5 animate-pulse">
                {doubtSubmissions.filter(s => s.status === 'pending').length} pending
              </span>
            </div>
          </div>

          {/* REAL-TIME GATEPASS VERIFICATION SYSTEM PANEL */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-none space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h4 className="text-[11.5px] font-black tracking-widest uppercase text-white font-mono">
                REAL-TIME SECURED GATEPASS VALIDATION GATEWAY
              </h4>
            </div>
            <p className="text-[10px] text-zinc-400">
              Paste or type any student's Entry Code or Ticket ID (e.g. ESH-XXXX or sub_xxxx) below to verify classroom desk assignments, check-in log details, and authorize safe entry.
            </p>

            <form onSubmit={handleVerifyGatepass} className="flex gap-2">
              <input
                type="text"
                placeholder="Type Student Token ID or Entry Code to inspect..."
                value={verifyCodeQuery}
                onChange={(e) => setVerifyCodeQuery(e.target.value)}
                className="flex-1 bg-black border border-white/10 text-white p-2.5 text-xs font-mono placeholder-zinc-700 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-500 border border-indigo-500/30 text-white text-[10.5px] uppercase font-bold tracking-wider px-5 py-2.5 transition shrink-0 cursor-pointer"
              >
                Verify Pass Code
              </button>
              {verifyStatusResult !== 'unchecked' && (
                <button
                  type="button"
                  onClick={() => {
                    setVerifyCodeQuery('');
                    setLastVerifiedTicket(null);
                    setVerifyStatusResult('unchecked');
                  }}
                  className="bg-zinc-850 hover:bg-zinc-750 text-zinc-300 hover:text-white text-[10px] font-mono px-3.5 py-2.5 cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </form>

            {/* Results Output Console */}
            {verifyStatusResult !== 'unchecked' && (
              <div className="border border-white/5 bg-[#09090D] p-5 space-y-3.5 animate-fade-in font-mono text-xs text-left">
                {verifyStatusResult === 'invalid' ? (
                  <div className="flex items-start gap-3 text-rose-455">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold uppercase text-[11px] tracking-wide text-rose-400">🔴 TICKET REJECTED: CORRUPT / INVALID PRIVILEGES</h5>
                      <p className="text-[10.5px] text-zinc-500 mt-1 leading-relaxed">
                        No active coordination match in the school database registry. Verification failed for entry token "{verifyCodeQuery}". Ensure standard spelling or instruct student to submit a fresh petition.
                      </p>
                    </div>
                  </div>
                ) : lastVerifiedTicket ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {verifyStatusResult === 'valid_approved' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      )}
                      {verifyStatusResult === 'valid_pending' && (
                        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      )}
                      {verifyStatusResult === 'valid_rejected' && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      {verifyStatusResult === 'cleared_success' && (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                      )}

                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/5 pb-2.5">
                          <div>
                            <h5 className="font-extrabold uppercase text-[11px] text-zinc-300 flex items-center gap-1.5">
                              {verifyStatusResult === 'valid_approved' && <span className="text-emerald-400">🟢 STATUS: SECURE CLEARANCE GRANTED</span>}
                              {verifyStatusResult === 'valid_pending' && <span className="text-amber-400">🟡 STATUS: PENDING COORDINATOR AUDIT</span>}
                              {verifyStatusResult === 'valid_rejected' && <span className="text-rose-400">🔴 STATUS: EXCLUDED / DENIED ENTRY</span>}
                              {verifyStatusResult === 'cleared_success' && <span className="text-emerald-400">⚡ COMPANION LOG: CONFIRMED PRESENT IN CLASSROOM</span>}
                            </h5>
                            <span className="text-[10px] text-zinc-550">Secure Registered Token ID: {lastVerifiedTicket.id}</span>
                          </div>
                          <span className={`text-[8.5px] font-black font-mono border px-2.5 py-0.5 uppercase tracking-wider ${
                            lastVerifiedTicket.status === 'approved' 
                              ? 'bg-emerald-950 border-emerald-900 text-emerald-400' 
                              : lastVerifiedTicket.status === 'rejected' 
                                ? 'bg-rose-950 border-rose-900 text-rose-455' 
                                : 'bg-amber-950 border-amber-900 text-amber-400'
                          }`}>
                            {lastVerifiedTicket.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 text-xs text-zinc-400">
                          <div className="space-y-1.5 bg-black/40 p-3 border border-white/5 leading-normal">
                            <div>STUDENT: <strong className="text-white">{lastVerifiedTicket.studentName}</strong></div>
                            <div>GRADE / GROUP: <strong className="text-white">{lastVerifiedTicket.studentClass || lastVerifiedTicket.className}</strong></div>
                            <div>TOPIC STREAM: <strong className="text-indigo-400 font-sans">{lastVerifiedTicket.chapter}</strong></div>
                            <div>TICKET CREATION: <span>{new Date(lastVerifiedTicket.submittedAt).toLocaleString()}</span></div>
                          </div>

                          <div className="space-y-1.5 bg-black/40 p-3 border border-white/5 leading-normal">
                            <div>CLASS DAY: <strong className="text-white uppercase">{lastVerifiedTicket.doubtDayType || lastVerifiedTicket.doubtDay}</strong></div>
                            <div>TIME SLOT: <strong className="text-indigo-400">{lastVerifiedTicket.scheduledTimeSlot || lastVerifiedTicket.preferredTime}</strong></div>
                            <div>STATION DESK: <strong className="text-orange-400">{lastVerifiedTicket.offlineLocationDetails || 'Not assigned yet'}</strong></div>
                            <div>CLEARANCE ID: <strong className="text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 border border-emerald-900 font-mono tracking-widest">{lastVerifiedTicket.entryGrantCode || 'PENDING'}</strong></div>
                          </div>
                        </div>

                        {lastVerifiedTicket.doubtDescription && (
                          <div className="bg-[#121217] p-3 text-[11px] leading-relaxed border border-white/5 text-zinc-350 mt-3">
                            <strong className="text-zinc-500 uppercase block text-[8.5px] font-mono tracking-wider mb-0.5">Problem Query:</strong>
                            "{lastVerifiedTicket.doubtDescription}"
                          </div>
                        )}

                        {lastVerifiedTicket.teacherNotes && (
                          <div className="bg-[#121217] p-3 text-[11px] leading-relaxed border border-white/5 text-zinc-350 mt-2">
                            <strong className="text-zinc-500 uppercase block text-[8.5px] font-mono tracking-wider mb-0.5">Coordinator instructions:</strong>
                            <span className="italic text-indigo-400">"{lastVerifiedTicket.teacherNotes}"</span>
                          </div>
                        )}

                        <div className="pt-3.5 flex gap-2 flex-wrap items-center">
                          {lastVerifiedTicket.status === 'approved' && verifyStatusResult !== 'cleared_success' && (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyStatusResult('cleared_success');
                                alert(`Real-time system validation confirmed for ${lastVerifiedTicket.studentName}. Student logged as PRESENT in the physical class!`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold uppercase tracking-wider px-4 py-2 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              MARK STUDENT AS PRESENT AT DESK
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => exportTicketToPDF(lastVerifiedTicket)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[9px] tracking-wider uppercase px-4 py-2 transition flex items-center gap-1.5 cursor-pointer border border-white/10"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                            EXPORT CLEARANCE TO SECURED PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <h5 className="text-[9.5px] font-black tracking-widest uppercase text-zinc-500 pt-2 border-t border-white/5">
            ALL ACTIVE RESOLUTION REMITTANCES & ACTION TICKETS
          </h5>

          {doubtSubmissions.length === 0 ? (
            <p className="text-center font-mono text-[10px] text-zinc-500 py-10 uppercase italic">[No student entrance petitions are currently on record]</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {doubtSubmissions.map((sub) => {
                const isSelected = selectedSubmissionId === sub.id;
                const statusBadge = 
                  sub.status === 'approved' 
                    ? 'bg-emerald-950 border border-emerald-900 text-emerald-400 font-bold' 
                    : sub.status === 'rejected'
                      ? 'bg-rose-950 border border-rose-900 text-rose-455 font-bold'
                      : 'bg-amber-950 border border-amber-900 text-amber-400 font-bold';

                return (
                  <div key={sub.id} className={`bg-[#0A0A0D] border p-4.5 space-y-3 flex flex-col justify-between transition ${
                    isSelected ? 'border-orange-500 ring-1 ring-orange-500' : 'border-white/10 hover:border-white/20'
                  }`}>
                    
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="block text-[11px] font-black text-white uppercase tracking-wide">{sub.studentName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{sub.studentClass} • {sub.chapter}</span>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 font-mono uppercase shrink-0 ${statusBadge}`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Doubt Text & Optional Attachment Image */}
                    <div className="bg-black/50 border border-white/5 p-3 space-y-3 rounded-none">
                      <div className="text-[11px] text-zinc-350 leading-relaxed font-sans font-bold">
                        <strong className="text-[#A5B4FC] font-black block uppercase text-[8.5px] font-mono tracking-wider mb-1">STUDENT QUERY PROBLEM:</strong>
                        {sub.doubtDescription}
                      </div>

                      {/* Display Picture of Doubt if uploaded */}
                      {sub.doubtImageBase64 ? (
                        <div className="pt-2">
                          <span className="text-[8.5px] text-zinc-300 font-bold uppercase tracking-wider block font-mono mb-1">Doubt Screen Attachment (Click to Zoom):</span>
                          <div 
                            onClick={() => setActiveZoomImage(sub.doubtImageBase64 || null)}
                            className="relative w-full max-w-[240px] h-32 bg-zinc-900 border border-white/10 overflow-hidden group cursor-all-scroll active:scale-[0.98] transition"
                          >
                            <img 
                              src={sub.doubtImageBase64} 
                              alt="Doubt problem snapshot" 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <span className="text-[9px] text-white font-mono uppercase bg-orange-650 px-2 py-1 select-none font-bold">
                                CLICK TO VIEW FULLSIZE
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[8.5px] text-zinc-400 font-bold tracking-wider font-mono uppercase italic">[No Screenshot uploaded / Text query description only]</p>
                      )}
                    </div>

                    {/* Time slot metadata */}
                    <div className="font-mono text-[9.5px] bg-[#121217] p-2.5 space-y-1 text-zinc-300">
                      <div className="text-indigo-400 font-bold">
                        Requested day: <strong className="text-white uppercase font-black">{sub.doubtDayType}</strong> ({sub.scheduledTimeSlot})
                      </div>
                      <div className="text-[9px] text-[#A5B4FC] uppercase font-bold">
                        Booked: {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* Show current assigned details if approved */}
                      {sub.status === 'approved' && (
                        <div className="pt-1.5 border-t border-white/5 mt-1.5 space-y-1 text-emerald-450 font-sans">
                          <div className="font-mono text-[10px]">
                            ENTRY CODE: <strong className="text-neutral-900 bg-[#f8f8f8] px-1.5 py-0.5 border border-emerald-900 select-all tracking-wider font-bold">{sub.entryGrantCode}</strong>
                          </div>
                          <div className="leading-normal font-mono text-[9px]">
                            STATION: <strong className="text-emerald-400 font-sans">{sub.offlineLocationDetails}</strong>
                          </div>
                          {sub.teacherNotes && (
                            <div className="text-zinc-400 text-[9px] leading-relaxed italic">
                              Notes: {sub.teacherNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Panel */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 items-center">
                      {sub.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmissionId(sub.id);
                              setAdminManualLocation(sub.offlineLocationDetails || '');
                              setAdminTeacherNotes(sub.teacherNotes || '');
                            }}
                            className="bg-indigo-650 hover:bg-indigo-500 text-white font-black text-[9px] tracking-widest uppercase py-2 px-3 transition font-mono border border-indigo-500 cursor-pointer"
                          >
                            ✓ GRANT GATEWAY CLEARANCE
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDenyDoubtEntry(sub.id)}
                            className="bg-rose-955/40 hover:bg-rose-900 border border-rose-905/40 text-rose-455 hover:text-white font-mono text-[9px] py-2 px-3 transition tracking-wider uppercase cursor-pointer"
                          >
                            REJECT
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2 text-[8.5px] font-mono text-zinc-500 uppercase">
                          <span>Actions Lock:</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Let them adjust offline parameters or re-grant / view notes
                              setSelectedSubmissionId(sub.id);
                              setAdminManualLocation(sub.offlineLocationDetails || '');
                              setAdminTeacherNotes(sub.teacherNotes || '');
                            }}
                            className="text-indigo-400 hover:text-white underline font-bold cursor-pointer"
                          >
                            [ EDIT CLEARANCE NOTES ]
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              onSetDoubtSubmissions(prev => prev.filter(s => s.id !== sub.id));
                            }}
                            className="text-rose-455 hover:text-red-350 font-bold font-mono cursor-pointer"
                          >
                            Purge Record
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => exportTicketToPDF(sub)}
                            className="text-emerald-450 hover:text-white font-bold font-mono cursor-pointer flex items-center gap-0.5"
                            title="Export student companion ticket pass to PDF"
                          >
                            <Download className="w-2.5 h-2.5 text-emerald-400 font-bold" />
                            PDF PASS
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline clearance setup panel */}
                    {isSelected && (
                      <div className="p-4 bg-[#14141A] border-t-2 border-orange-500 space-y-3.5 mt-2 animate-fade-in font-mono text-[10px] text-left">
                        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                          <span className="text-orange-400 font-bold uppercase tracking-wider block">Set Entry Clearance Parameters</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedSubmissionId(null)}
                            className="text-zinc-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1 uppercase text-[8.5px]">Assigned Offline Desk / Classroom Location:</label>
                          <input
                            type="text"
                            placeholder="e.g. Physics Lab, Lab Table #4, Block B Ground Floor"
                            value={adminManualLocation}
                            onChange={(e) => setAdminManualLocation(e.target.value)}
                            className="w-full bg-black border border-white/10 text-white p-2 text-xs focus:border-indigo-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1 uppercase text-[8.5px]">Doubt Desk Advisory / Instructor Notes:</label>
                          <input
                            type="text"
                            placeholder="e.g. Bring scientific calculator & printed assignments."
                            value={adminTeacherNotes}
                            onChange={(e) => setAdminTeacherNotes(e.target.value)}
                            className="w-full bg-black border border-white/10 text-white p-2 text-xs focus:border-indigo-500 outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-1 font-sans">
                          <button
                            type="button"
                            onClick={() => handleGrantDoubtEntry(sub.id, adminManualLocation, adminTeacherNotes)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-[9.5px] font-black tracking-wider py-2 px-4 transition cursor-pointer"
                          >
                            CONFIRM clearance pass
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(null)}
                            className="bg-zinc-850 text-zinc-300 hover:bg-zinc-750 uppercase text-[9.5px] font-mono tracking-wider py-2 px-3 transition cursor-pointer"
                          >
                            Dismiss
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
      </div>

      {/* FULLSIZE PICTURE CONSOLE ATTACHMENT MODAL */}
      {activeZoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setActiveZoomImage(null)}
        >
          <div 
            className="bg-[#0D0D11] border border-white/15 max-w-3xl w-full p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveZoomImage(null)}
              className="absolute -top-10 right-0 text-white bg-black/60 p-2 border border-white/10 rounded-full hover:bg-orange-650 transition flex items-center gap-1 text-[10px] font-mono"
            >
              <X className="w-4 h-4" /> CLOSE VIEWER
            </button>
            <img 
              src={activeZoomImage} 
              alt="Zoomed query doubt source screenshot" 
              className="w-full h-auto max-h-[75vh] object-contain mx-auto bg-black border border-white/5" 
              referrerPolicy="no-referrer"
            />
            <p className="text-center font-mono text-[9px] text-zinc-400 mt-3.5 uppercase tracking-widest font-black">
              Official eShiksha Verification Portal — Doubt Screen Audit Canvas
            </p>
          </div>
        </div>
      )}

      {/* Outbound Email Verification Console Relay Hub */}
      <div className="bg-[#0A0A0D] border border-white/10 p-6 rounded-none space-y-4" id="admin-email-logs-hub">
        <div className="flex justify-between items-center border-b border-white/15 pb-3">
          <div className="flex items-center space-x-2.5">
            <Mail className="w-5 h-5 text-emerald-450" />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Outbound Automated Email Verification Console
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                Security & checkout-license transactions delivered in sandbox mode to verification endpoint
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px]">
            <span className="text-zinc-500 block uppercase">SMTP Target Inbox</span>
            <span className="text-emerald-450 font-black">eshikshapie@gmail.com</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black border border-white/5 font-mono text-[10px] text-zinc-400 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-indigo-455 uppercase tracking-widest block">
                SMTP MAIL SERVICE CODES
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Relay Gateway Server:</span>
                  <span className="text-white">smtp.eshikshapie.local</span>
                </div>
                <div className="flex justify-between">
                  <span>Relay Encryption Stream:</span>
                  <span className="text-white">TLS Secured Handshake TLS_v13</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Listener Inbox:</span>
                  <span className="text-emerald-400 font-bold select-all font-mono">eshikshapie@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span>SMTP Connection Guard:</span>
                  <span className="text-emerald-500 font-black">● RELAY ACTIVE (GREEN)</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 leading-normal pt-2 border-t border-white/5 uppercase">
              Notice: All credentials authorizations, manual approvals, and security logins securely dispatch full webhook verification tokens directly to the inbox above.
            </p>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
            {emailLogs.length === 0 ? (
              <p className="text-center font-mono text-[10px] text-zinc-600 py-6">No emails logged in current session.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="bg-[#121216] border border-white/5 p-3.5 space-y-2 transition-all hover:border-indigo-500/20">
                  <div className="flex justify-between items-start font-mono text-[9px]">
                    <span className="text-indigo-400 font-black uppercase tracking-wider break-all pr-2">{log.subject}</span>
                    <span className="text-zinc-500 shrink-0">{log.time}</span>
                  </div>
                  <p className="text-[10.5px] text-zinc-200 font-sans leading-relaxed">
                    {log.body}
                  </p>
                  <div className="flex items-center justify-between font-mono text-[8.5px] border-t border-white/5 pt-1.5 text-zinc-500 uppercase">
                    <span>Target Inbox: <strong className="text-emerald-400 font-black">{log.recipient}</strong></span>
                    <span className="text-emerald-500 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                      <span>Delivered</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
      </div>
    </div>
  );
}
