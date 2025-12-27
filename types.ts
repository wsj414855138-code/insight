export interface AudioAnalysisResult {
  transcription: string;
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  sentimentScore: number; // 0-100
  keyPoints: string[];
  painPoints: string[];
}

export enum QuestionType {
  SingleChoice = 'single_choice',
  MultipleChoice = 'multiple_choice',
  OpenText = 'open_text',
  Rating = 'rating'
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For choice types
  required: boolean;
}

export interface SurveySchema {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface ReportDataPoint {
  name: string;
  value: number;
}

export interface ReportInsight {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface GeneratedReport {
  summary: string;
  insights: ReportInsight[];
  chartData: ReportDataPoint[];
}

// New types for the detailed structural report
export interface StructuredSection {
  title: string;
  icon: 'star' | 'quote' | 'bulb' | 'list';
  content: string;
  quotes?: string[];
}

export interface DetailedInterviewReport {
  mainConclusion: string; // Pyramid Top
  topicAnalysis: ReportDataPoint[]; // For the chart illustration
  sections: StructuredSection[]; // Supporting arguments
}

export type ViewState = 'dashboard' | 'audio' | 'survey' | 'report';