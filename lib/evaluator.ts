// ──────────────────────────────────────────────────────────────────────────────
// Candidate Evaluator — Azure OpenAI integration
// ──────────────────────────────────────────────────────────────────────────────

import {
  chatCompletionWithMeta,
  parseJsonResponse,
  AnalysisTruncatedError,
} from './openai-client';
import {
  CANDIDATE_EVAL_SYSTEM_PROMPT,
  buildCandidateEvalUserPrompt,
  QUICK_SCREEN_SYSTEM_PROMPT,
  buildQuickScreenUserPrompt,
} from './prompts';
import type { CandidateEvaluation } from './types';

interface EvalOptions {
  mode: 'jd-match' | 'quick-screen';
}

/**
 * Run candidate evaluation against a job description.
 * This is the interviewer-perspective equivalent of CareerOS's runResumeScanner.
 */
export async function evaluateCandidate(
  resumeText: string,
  jobDescription: string,
  jobCategory?: string,
  options: EvalOptions = { mode: 'jd-match' },
): Promise<CandidateEvaluation> {
  const isQuickScreen = options.mode === 'quick-screen';

  const resumeLen = resumeText.length;
  const baseTokens =
    resumeLen <= 3000 ? 5000 : resumeLen <= 8000 ? 7000 : resumeLen <= 16000 ? 8000 : 9000;
  // JD-match needs more tokens for keyword/question analysis
  const maxTokens = isQuickScreen ? baseTokens : baseTokens + 1500;

  const timeoutMs = resumeLen <= 3000 ? 20000 : 22000;

  const systemPrompt = isQuickScreen ? QUICK_SCREEN_SYSTEM_PROMPT : CANDIDATE_EVAL_SYSTEM_PROMPT;
  const userPrompt = isQuickScreen
    ? buildQuickScreenUserPrompt(resumeText)
    : buildCandidateEvalUserPrompt(resumeText, jobDescription, jobCategory);

  const result = await chatCompletionWithMeta(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens,
    timeoutMs,
    maxRegions: 2,
  });

  if (result.finishReason === 'length') {
    throw new AnalysisTruncatedError(result.content.length, maxTokens, result.region);
  }

  const evaluation = parseJsonResponse<CandidateEvaluation>(result.content);

  // Ensure scores.overall matches dimension sum
  const dimensionSum =
    evaluation.dimensions.technicalFit.score +
    evaluation.dimensions.experienceRelevance.score +
    evaluation.dimensions.achievementQuality.score +
    evaluation.dimensions.cultureFit.score +
    evaluation.dimensions.growthPotential.score;
  evaluation.overallScore = dimensionSum;
  evaluation.scores.overall = dimensionSum;

  return evaluation;
}
