// ──────────────────────────────────────────────────────────────────────────────
// Candidate Evaluation Types
// ──────────────────────────────────────────────────────────────────────────────

/** Overall evaluation result returned by the AI analysis */
export interface CandidateEvaluation {
  /** Candidate's name extracted from CV */
  candidateName: string | null;

  /** Verdict: strongly_recommend | recommend | neutral | not_recommend | strongly_not_recommend */
  verdict: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend' | 'strongly_not_recommend';

  /** Overall fit score 0-100 */
  overallScore: number;

  /** Score justification */
  scoreJustification: {
    letterGrade: string;
    summary: string;
  };

  /** Dimension scores (each 0-20) */
  dimensions: {
    technicalFit: { score: number; analysis: string };
    experienceRelevance: { score: number; analysis: string };
    achievementQuality: { score: number; analysis: string };
    cultureFit: { score: number; analysis: string };
    growthPotential: { score: number; analysis: string };
  };

  /** Summary scores (derived from dimensions) */
  scores: {
    overall: number;
    technical: number;
    experience: number;
    potential: number;
  };

  /** Keyword analysis */
  keywords: {
    matched: string[];
    missing: string[];
  };

  /** Skills assessment */
  skillsAssessment: {
    strongMatches: string[];
    partialMatches: string[];
    missingCritical: string[];
    bonusSkills: string[];
  };

  /** Top strengths of this candidate */
  strengths: {
    title: string;
    description: string;
  }[];

  /** Concerns or red flags */
  concerns: {
    title: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }[];

  /** Suggested interview questions based on CV gaps/claims */
  interviewQuestions: {
    category: 'technical' | 'behavioral' | 'experience' | 'clarification';
    question: string;
    rationale: string;
  }[];

  /** Key insights for the hiring manager */
  insights: string[];

  /** Detected language of the CV */
  resumeLanguage: 'en' | 'zh';

  /** Parsed sections from the CV */
  parsedSections: {
    sectionName: string;
    sectionType: string;
    originalText: string;
  }[];

  /** Extracted job info */
  extractedJobInfo: {
    company: string | null;
    jobTitle: string | null;
  };
}

/** API response shape */
export interface EvaluateResponse {
  success: boolean;
  data?: CandidateEvaluation & {
    evaluationId: string;
  };
  error?: string;
}

/** Auth user from SWA */
export interface ClientPrincipal {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}
