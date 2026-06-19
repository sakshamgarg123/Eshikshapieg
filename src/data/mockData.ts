/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Quiz, Assignment, Submission, QuizAttempt, LiveClass, Subject } from '../types';

export const TEACHERS = [
  { id: 't1', name: 'Dr. Sarah Jenkins', subject: 'Physics' as Subject, credential: 'phys123', email: 'jenkins@classroom.edu' },
  { id: 't2', name: 'Prof. Alan Turing', subject: 'Mathematics' as Subject, credential: 'math123', email: 'turing@classroom.edu' },
  { id: 't3', name: 'Dr. Marie Curie', subject: 'Chemistry' as Subject, credential: 'chem123', email: 'curie@classroom.edu' },
  { id: 't4', name: 'Dr. Rosalind Franklin', subject: 'Biology' as Subject, credential: 'bio123', email: 'franklin@classroom.edu' },
  { id: 't5', name: 'Ms. Emily Dickinson', subject: 'English' as Subject, credential: 'lit123', email: 'dickinson@classroom.edu' }
];

export const STUDENTS_SEED: Student[] = [];

export const INITIAL_QUIZZES: Quiz[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [];

export const INITIAL_LIVE_CLASSES: LiveClass[] = [];
