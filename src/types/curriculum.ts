export interface WorkedStep {
  math: string;
  explanation: string;
  keyRule?: string;
}

export interface WorkedExample {
  title: string;
  problem: string;
  steps: WorkedStep[];
  finalAnswer: string;
  summary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  eli5: string; // "Explain Like I'm 5" single crystal-clear sentence
  analogy: string;
  conceptDeepDive: string;
  formalNotation: string;
  formulaNote?: string;
  workedExample: WorkedExample;
  claraTip: string;
  interactiveWidgetType?: 'derivative' | 'riemann' | 'taylor' | 'optimization' | 'none';
  quiz: QuizQuestion;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  iconName: string;
  color: string;
  topics: Topic[];
}

export interface Formula {
  id: string;
  name: string;
  category: 'Limits' | 'Derivatives' | 'Integrals' | 'Series' | 'Trigonometry' | 'Multivariable';
  latex: string;
  eli5: string;
  whenToUse: string;
  example: string;
}
