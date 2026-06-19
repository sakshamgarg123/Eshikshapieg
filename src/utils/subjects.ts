import { Subject, ClassGrade } from '../types';

export interface SubjectOption {
  id: Subject;
  name: string;
  tag: string;
  color: string;
}

export interface StreamedSubjects {
  stream: string;
  subjects: SubjectOption[];
}

export const getSubjectsForClass = (classLevel: ClassGrade): StreamedSubjects[] => {
  const classNum = parseInt(classLevel.replace('Class ', '')) || 0;
  
  if (classNum >= 1 && classNum <= 10) {
    return [{
      stream: 'General',
      subjects: [
        { id: 'Mathematics', name: 'MATHEMATICS', tag: 'CORE SUBJECT', color: 'border-blue-500 text-blue-400 bg-blue-950/10' },
        { id: 'Science', name: 'SCIENCE', tag: 'FOUNDATION', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/10' },
        { id: 'Hindi', name: 'HINDI', tag: 'LANGUAGE', color: 'border-red-500 text-red-400 bg-red-950/10' },
        { id: 'Social Science', name: 'SOCIAL SCIENCE', tag: 'GENERAL', color: 'border-amber-500 text-amber-400 bg-amber-950/10' },
        { id: 'English', name: 'ENGLISH', tag: 'LANGUAGE', color: 'border-indigo-500 text-indigo-400 bg-indigo-950/10' },
        { id: 'Sanskrit', name: 'SANSKRIT', tag: 'LANGUAGE', color: 'border-purple-500 text-purple-400 bg-purple-950/10' },
        { id: 'Urdu', name: 'URDU', tag: 'LANGUAGE', color: 'border-pink-500 text-pink-400 bg-pink-950/10' },
        { id: 'Health and Physical Education', name: 'HEALTH & PE', tag: 'WELLNESS', color: 'border-teal-500 text-teal-400 bg-teal-950/10' },
        { id: 'Mental Ability', name: 'MENTAL ABILITY', tag: 'APTITUDE', color: 'border-cyan-500 text-cyan-400 bg-cyan-950/10' },
      ]
    }];
  }
  
  if (classNum >= 11 && classNum <= 12) {
    return [
      {
        stream: 'Science',
        subjects: [
          { id: 'Physics', name: 'PHYSICS', tag: 'SCIENCE', color: 'border-blue-500 text-blue-400 bg-blue-950/10' },
          { id: 'Chemistry', name: 'CHEMISTRY', tag: 'SCIENCE', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/10' },
          { id: 'Mathematics', name: 'MATHEMATICS', tag: 'SCIENCE', color: 'border-orange-500 text-orange-400 bg-orange-950/10' },
          { id: 'English', name: 'ENGLISH', tag: 'COMPULSORY', color: 'border-indigo-500 text-indigo-400 bg-indigo-950/10' },
        ]
      },
      {
        stream: 'Commerce',
        subjects: [
          { id: 'Accounts', name: 'ACCOUNTS', tag: 'COMMERCE', color: 'border-cyan-500 text-cyan-400 bg-cyan-950/10' },
          { id: 'Business', name: 'BUSINESS', tag: 'COMMERCE', color: 'border-rose-500 text-rose-400 bg-rose-950/10' },
          { id: 'Economic', name: 'ECONOMICS', tag: 'COMMERCE', color: 'border-lime-500 text-lime-400 bg-lime-950/10' },
          { id: 'English', name: 'ENGLISH', tag: 'COMPULSORY', color: 'border-indigo-500 text-indigo-400 bg-indigo-950/10' },
        ]
      }
    ];
  }
  
  return [{ stream: 'General', subjects: [{ id: 'Mathematics', name: 'MATHEMATICS', tag: 'BASIC', color: 'border-blue-500 text-blue-400 bg-blue-950/10' }] }];
};
