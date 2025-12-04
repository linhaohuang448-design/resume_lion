export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  isTyping?: boolean;
}

export enum TemplateType {
  COMPETITION = 'COMPETITION',
  CLUB = 'CLUB',
  VOLUNTEER = 'VOLUNTEER',
  ACTIVITY = 'ACTIVITY', // Activities + Part-time work
  PROJECT = 'PROJECT',
}

export interface Question {
  id: string;
  text: string;
  field: string;
  placeholder: string;
}

export interface ExperienceTemplate {
  type: TemplateType;
  name: string;
  topicGuides: { field: string; topic: string }[]; // Changed from strict questions to topics
}

export interface CandidateExperience {
  id: string; 
  name: string;
  type: TemplateType;
  // Key-value pairs of details user ALREADY provided in the first message
  // e.g. { result: "二等奖", role: "队长" }
  initialInfo: Record<string, string>; 
}

export interface ResumeDirection {
  id: string;
  title: string;
  description: string;
  projectIds: string[];
}

export interface AnalysisResult {
  projects: CandidateExperience[];
  directions: ResumeDirection[];
  // Items filtered out (e.g., "Playing games")
  ignoredItems: { name: string; reason: string }[];
}

export interface InterviewSession {
  projectId: string;
  projectName: string;
  templateType: TemplateType;
  answers: Record<string, string>;
}

export interface FinalResult {
  resumeSections: {
    projectName: string;
    bullets: string[];
  }[];
  recommendedJobs: {
    title: string;
    matchReason: string;
  }[];
}

export type AppState = 
  | 'IDLE' 
  | 'ANALYZING' 
  | 'SELECTING_DIRECTION' 
  | 'PREPARING_QUESTIONS' // New state for generating custom questions
  | 'INTERVIEWING' 
  | 'GENERATING' 
  | 'FINISHED';