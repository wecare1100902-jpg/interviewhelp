// ──────────────────────────────────────────────────────────────────────────────
// POST /api/evaluate — Candidate CV evaluation endpoint
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { resolveMimeType, isAllowedMimeType, extractTextFromFile } from '@/lib/file-extract';
import { evaluateCandidate } from '@/lib/evaluator';
import { uploadCVToBlob } from '@/lib/azure-storage';
import { saveEvaluation } from '@/lib/azure-table';
import { AnalysisTruncatedError } from '@/lib/openai-client';
import type { EvaluateResponse } from '@/lib/types';

const HAS_AZURE_STORAGE = Boolean(process.env.AZURE_STORAGE_CONNECTION_STRING);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest): Promise<NextResponse<EvaluateResponse>> {
  const user = getUserFromRequest(request);

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const jobDescription = ((formData.get('jobDescription') as string) || '').trim();
    const jobCategory = ((formData.get('jobCategory') as string) || '').trim();

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: '請上傳候選人的履歷檔案' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '檔案大小不可超過 10MB' },
        { status: 400 },
      );
    }

    // Validate MIME type
    const effectiveMimeType = resolveMimeType(file.name, file.type);
    if (!isAllowedMimeType(effectiveMimeType)) {
      return NextResponse.json(
        { success: false, error: '僅支援 PDF、TXT、DOCX、Markdown 格式' },
        { status: 400 },
      );
    }

    // Validate JD (required for proper evaluation)
    if (jobDescription.length < 30) {
      return NextResponse.json(
        { success: false, error: '請提供至少 30 字的職缺描述，以便進行精準評估' },
        { status: 400 },
      );
    }

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text: resumeText, truncated } = await extractTextFromFile(buffer, effectiveMimeType);

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { success: false, error: '無法從檔案中擷取足夠的文字內容。請確認檔案非加密 PDF。' },
        { status: 400 },
      );
    }

    // Upload to blob storage
    let blobUrl: string | null = null;
    if (HAS_AZURE_STORAGE) {
      blobUrl = await uploadCVToBlob(buffer, file.name, effectiveMimeType);
    }

    // Run AI evaluation
    const mode = jobDescription ? 'jd-match' : 'quick-screen';
    const evaluation = await evaluateCandidate(resumeText, jobDescription, jobCategory, { mode });

    // Generate evaluation ID
    const evaluationId = `eval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Save to storage
    if (HAS_AZURE_STORAGE && user) {
      await saveEvaluation(user.userId, evaluationId, {
        ...evaluation,
        evaluationId,
        blobUrl,
        jobDescription,
        jobCategory,
        truncated,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...evaluation,
        evaluationId,
      },
    });
  } catch (err) {
    console.error('Evaluation failed:', err);

    if (err instanceof AnalysisTruncatedError) {
      return NextResponse.json(
        { success: false, error: 'AI 分析結果過長，請簡化職缺描述後重試。' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: false, error: '評估過程發生錯誤，請稍後再試。' },
      { status: 500 },
    );
  }
}
