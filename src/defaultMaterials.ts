import { ChapterMaterial } from './types';

export const DEFAULT_CHAPTER_MATERIALS: ChapterMaterial[] = [
  // ==========================================
  // MATHS CHAPTERS
  // ==========================================
  {
    id: 'mat-ch1-theory',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'booklet',
    subType: 'theory',
    title: 'Theory Unit: Types of Relations & Bijective Functions',
    content: `A relation R in a set A is called Reflexive if (a, a) ∈ R for every a ∈ A; Symmetric if (a, b) ∈ R implies (b, a) ∈ R; and Transitive if (a, b) ∈ R and (b, c) ∈ R implies (a, c) ∈ R. An Equivalence Relation satisfies all three properties.

A function f: A → B is One-One (Injective) if f(x) = f(y) ⇒ x = y for all x, y ∈ A. It is Onto (Surjective) if each element in B is the image of some element in A (Range of f = B). If a function is both Injective and Surjective, it is Bijective and thus invertible.`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '25-05-2026'
  },
  {
    id: 'mat-ch1-examples',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'booklet',
    subType: 'examples',
    title: 'Core Step-by-Step Solved Examples',
    content: `Example 1: Prove R = {(a,b) : a ≤ b²} on Real Numbers is neither reflexive, symmetric, nor transitive.
Solution:
1) Reflexive check: For a = 1/2, (1/2) ≤ (1/2)² is false (1/2 ≤ 1/4 is wrong). So R is not reflexive.
2) Symmetric check: (1, 2) ∈ R because 1 ≤ 4, but (2, 1) ∉ R because 2 > 1. So it is not symmetric.
3) Transitive check: Take (3, 2) and (2, 1.5). 3 ≤ 4 and 2 ≤ 2.25, but 3 > 2.25. So it is not transitive.`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '26-05-2026'
  },
  {
    id: 'mat-ch1-pyq',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'booklet',
    subType: 'pyq',
    title: 'Board Collection: Past 10 Years Solved PYQs',
    content: `Board Exam Question (Delhi Set A):
Let f: R - {4/3} → R be a function styled as f(x) = (4x + 3) / (3x + 4). Show f is a bijection. Find its algebraic inverse.

Answer derivation:
1) Injective: f(u)=f(v) ⇒ (4u+3)/(3u+4) = (4v+3)/(3v+4) ⇒ 12uv+16u+9v+12 = 12uv+16v+9u+12 ⇒ 7u = 7v ⇒ u=v. Hence One-One!
2) Surjective: Set y = (4x+3)/(3x+4). Cross-multiply and isolate x: 3xy + 4y = 4x + 3 ⇒ x(3y - 4) = 3 - 4y ⇒ x = (3 - 4y)/(3y - 4). Since for every y ∈ R except 4/3, there resides a corresponding real x, the function is Onto!
3) Inverse: f⁻¹(y) = (3 - 4y)/(3y - 4).`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '27-05-2026'
  },
  {
    id: 'mat-ch1-practice',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'booklet',
    subType: 'practice',
    title: 'Objective & Subjective Practice Workout Sheets',
    content: `Objective Questions:
1. Let A = {1, 2, 3}. The number of equivalence relations containing (1, 2) is:
   (a) 2  (b) 3  (c) 5  (d) 1  [Correct Ans: (a) - 2 relations]
   
Subjective Questions:
2. Show that the relation R in the set Z of integers given by R = {(x, y) : x - y is divisible by 5} is indeed an equivalence relation.`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '28-05-2026'
  },
  {
    id: 'mat-ch1-dpp',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'booklet',
    subType: 'dpp',
    title: 'Daily Practice Problem Sheet: DPP No. 1.1',
    content: `DPP No. 1.1 (Equivalence Matrix & Mappings)
Total Marks: 20
Time limit: 25 mins

Q1. State why the relation R = {(a,b) : |a - b| is a multiple of 4} on Set A = {x ∈ Z : 0 ≤ x ≤ 12} is equivalence. [4 Marks]
Q2. If f(x) = x + 7 and g(x) = x - 7, show that fog = gof = identity map. [4 Marks]`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '29-05-2026'
  },
  {
    id: 'mat-ch1-video',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'video',
    title: 'Whiteboard Recording: Deconstructing Mappings',
    content: 'Visual Masterclass explaining injection, surjection and the composite function theorem using mapping matrices.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '29-05-2026'
  },
  {
    id: 'mat-ch1-test',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'test',
    title: 'Chapter Level assessment: Relations & Functions Quiz',
    content: `Take this 5-question immediate feedback challenge to test your conceptual clarity.
Question 1: Let R be a reflexive relation on A. Prove that the inverse of R is also reflexive.
Question 2: Calculate the number of bijective functions possible on set A containing 5 elements. (Ans: 5! = 120)`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '30-05-2026'
  },
  {
    id: 'mat-ch1-ncert',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'ncert',
    title: 'NCERT Textbook Solutions Complete Exercise 1.1',
    content: `Detailed Solutions for Exercises:
Ex 1.1 Q1: Determine whether each of the following relations is reflexive, symmetric, and transitive...
Solution step: Relation R in the set A = {1, 2, ..., 14} defined as R = {(x, y) : 3x - y = 0}. Thus R = {(1, 3), (2, 6), (3, 9), (4, 12)}.
- (1, 1) ∉ R, so not reflexive.
- (1, 3) ∈ R but (3, 1) ∉ R, so not symmetric.
- (1, 3) ∈ R, (3, 9) ∈ R, but (1, 9) ∉ R, so not transitive!`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '30-05-2026'
  },
  {
    id: 'mat-ch1-qbank',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'question_bank',
    title: 'Subjective & Objective Comprehensive Question Bank',
    content: `Exhaustive high-yield pool.
★ Objective Q: Let R be the relation on natural numbers defined by aRb if a is a divisor of b. Is R symmetric? Ans: No.
★ Subjective Q: Show that the relation in the set mapping coordinates A × A defined by (a, b) R (c, d) iff a+d = b+c is an equivalence relation.`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '01-06-2026'
  },
  {
    id: 'mat-ch1-notes',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'revision_notes',
    title: 'Quick Revision Note Sheet: Mnemonic Mapping',
    content: `1. Reflexive: (x,x) ∈ R ∀ x ∈ A
2. Symmetric: (x,y) ∈ R ⇒ (y,x) ∈ R
3. Transitive: (x,y) ∈ R and (y,z) ∈ R ⇒ (x,z) ∈ R
4. Total relations in A x A: 2^(n²)
5. Reflexive relations count: 2^(n² - n)`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '02-06-2026'
  },
  {
    id: 'mat-ch1-mlc',
    subject: 'Mathematics',
    chapterId: 'CH-1',
    chapterName: 'Relations and Functions',
    materialType: 'mlc',
    title: 'M.L.C: Basic Passing Content (Relations & Functions)',
    content: `Minimum Learning Content designed to help struggling students:
1. Memorize definitions: Reflexive, Symmetric, and Transitive. If a question is worth 5 marks, writing definitions correctly secures at least 1.5 marks.
2. Note standard boards question: "Prove modular addition relation is equivalence". Know the form of congruent equations.
3. Bijection means: Check if 1D lines are straight linear equations like f(x) = ax + b, they are ALWAYS bijection.`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '02-06-2026'
  },

  // MATHS CH-2 Inverse Trigonometric Functions
  {
    id: 'mat-ch2-theory',
    subject: 'Mathematics',
    chapterId: 'CH-2',
    chapterName: 'Inverse Trigonometric Functions',
    materialType: 'booklet',
    subType: 'theory',
    title: 'Inverse Trig Theory: Principal Values and Domain Ranges',
    content: `Trigonometric functions are periodic, so they are not one-to-one worldwide. To define their inverses, we must restrict their domains to the principal value branches.
For sin⁻¹(x), domain is [-1, 1], principal value range is [-π/2, π/2].
For cos⁻¹(x), domain is [-1, 1], principal value range is [0, π].
For tan⁻¹(x), domain is Real numbers R, principal branch is (-π/2, π/2).`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '03-06-2026'
  },

  // ==========================================
  // SCIENCE CHAPTERS
  // ==========================================
  {
    id: 'sci-ch1-theory',
    subject: 'Science',
    chapterId: 'CH-1',
    chapterName: 'Electrostatics & Electric Fields',
    materialType: 'booklet',
    subType: 'theory',
    title: 'Electrostatics Study booklet: Coulomb\'s Law & Field Vectors',
    content: `Electrostatics is the study of electromagnetic behavior where charges are stationary. Coulomb's Law states that the electrostatic force between two point charges q₁ and q₂ separated by distance r is F = (1 / 4πε₀) * (q₁q₂ / r²).
The Electric Field E at any point is defined as the force experienced per unit positive probe charge. E = q / (4πε₀ r²). Fields originate from positive charges and terminate at negative charges.`,
    authorTeacher: 'Dr. Sarah Jenkins',
    createdAt: '22-05-2026'
  },
  {
    id: 'sci-ch1-video',
    subject: 'Science',
    chapterId: 'CH-1',
    chapterName: 'Electrostatics & Electric Fields',
    materialType: 'video',
    title: 'Physics Lab Lecture: Mapping Gauss\'s Law Surfaces',
    content: 'Full video walkthrough of flux calculations across closed symmetric cylinders. Recommended for competitive mock prep.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorTeacher: 'Dr. Sarah Jenkins',
    createdAt: '25-05-2026'
  },
  {
    id: 'sci-ch1-mlc',
    subject: 'Science',
    chapterId: 'CH-1',
    chapterName: 'Electrostatics & Electric Fields',
    materialType: 'mlc',
    title: 'M.L.C: Standard Core Principles of Electrostatics',
    content: `Passing Essentials:
1. Coulomb's formula: Remember force is inversely proportional to square of radius.
2. State quantization of charge: Q = ±ne, where e = 1.6 x 10⁻¹⁹ C.
3. Draw Electric fields for a positive and negative point charge. Positive goes OUTwards, Negative goes INwards. Always draws arrows correctly!`,
    authorTeacher: 'Dr. Sarah Jenkins',
    createdAt: '26-05-2026'
  },

  // SCIENCE CH-2 Chemical Reactions & Equations
  {
    id: 'sci-ch2-theory',
    subject: 'Science',
    chapterId: 'CH-2',
    chapterName: 'Chemical Reactions & Equations',
    materialType: 'booklet',
    subType: 'theory',
    title: 'Chemical Reactions: Balanced Equations and Reaction Speeds',
    content: `Chemical changes involve rearrangement of atoms to formulate new compounds. An equation must be balanced to satisfy the Law of Conservation of Mass.
Types of chemical reactions: 
1. Combination: A + B → AB.
2. Decomposition: AB → A + B.
3. Displacement: A + BC → AC + B (depends on reactivity index).
4. Double Displacement: Exchange of ions resulting in a precipitate.`,
    authorTeacher: 'Dr. Sarah Jenkins',
    createdAt: '01-06-2026'
  },

  // ==========================================
  // SST (SOCIAL STUDIES) CHAPTERS
  // ==========================================
  {
    id: 'sst-ch1-theory',
    subject: 'Social Science',
    chapterId: 'CH-1',
    chapterName: 'Nationalism in Europe',
    materialType: 'booklet',
    subType: 'theory',
    title: 'The Rise of Nationalism in Europe: Historical Milestones',
    content: `During the 19th century, nationalism emerged as a force which swept far-reaching changes in the political and mental world of Europe. The French Revolution of 1789 was the first clear expression of nationalism. It proclaimed that the people would henceforth constitute the nation and shape its destiny.
Key figures: Giuseppe Mazzini (founded Young Italy), Count Cavour, Otto von Bismarck (Architect of German Unification).`,
    authorTeacher: 'Admin Core Staff',
    createdAt: '18-05-2026'
  },
  {
    id: 'sst-ch1-video',
    subject: 'Social Science',
    chapterId: 'CH-1',
    chapterName: 'Nationalism in Europe',
    materialType: 'video',
    title: 'Documentary: Unification of Germany and Italy',
    content: 'An immersive historical narrative dissecting the Treaty of Vienna and structural movements of 1848.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorTeacher: 'Admin Core Staff',
    createdAt: '20-05-2026'
  },
  {
    id: 'sst-ch1-mlc',
    subject: 'Social Science',
    chapterId: 'CH-1',
    chapterName: 'Nationalism in Europe',
    materialType: 'mlc',
    title: 'M.L.C: High-Value Historical Bullet Points',
    content: `Essential Summary of Nationalism in Europe:
1. Napoleon Civil Code (1804): Simplified administrative divisions, abolished feudal system, and secured right to property.
2. Treaty of Vienna (1815): Signed by Britain, Russia, Prussia, and Austria to restore conservative regimes.
3. Balkan Area: Main hotspot of geopolitical crisis leading to World War I. Knowing Balkan geography guarantees map-work marks.`,
    authorTeacher: 'Admin Core Staff',
    createdAt: '21-05-2026'
  },

  // ==========================================
  // MENTAL ABILITY CHAPTERS
  // ==========================================
  {
    id: 'men-ch1-theory',
    subject: 'Mental Ability',
    chapterId: 'CH-1',
    chapterName: 'Series Completion & Analogy',
    materialType: 'booklet',
    subType: 'theory',
    title: 'Patterns Matrix: Solving Numerical & Alphabetical Series',
    content: `Logical serie completion tests the ability to detect logical order or pattern sequences. 
Standard types:
1. Arithmetic progression series (adding or subtracting a constant difference).
2. Fibonacci-like series (each number is sum of preceding two).
3. Prime numbers, square sequences, and geometric ratios.
Analogy tests: A:B :: C:D. Find the missing element based on the pattern established between A and B (e.g. Country:Capital, Tool:Worker).`,
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '15-05-2026'
  },
  {
    id: 'men-ch1-video',
    subject: 'Mental Ability',
    chapterId: 'CH-1',
    chapterName: 'Series Completion & Analogy',
    materialType: 'video',
    title: 'Shortcuts: Solving Direction & Series Patterns',
    content: 'Cracking competitive exam series inside 10 seconds. Top 8 tricks for detecting hidden differences.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorTeacher: 'Dr. Aarav Sharma',
    createdAt: '17-05-2026'
  }
];
