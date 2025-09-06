export interface CriteriaScores {
  content_quality: number;
  technical_accuracy: number;
  presentation: number;
  completeness: number;
  innovation: number;
  [key: string]: number;
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  feedback: string[];
  suggestions: string[];
  criteriaScores: CriteriaScores | Record<string, number>;
  detailedAnalysis: string;
  gradeLevelFeedback: string;
}

export interface SubmissionHistory {
  id: number;
  major: string;
  specialization: string;
  grade: string;
  task: string;
  score: number;
  timestamp: Date;
  status: "passed" | "needs_improvement";
}

export interface Curriculum {
  [major: string]: {
    [specialization: string]: {
      [grade: number]: string[];
    };
  };
}
