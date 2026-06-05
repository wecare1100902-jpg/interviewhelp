'use client';

import { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CandidateEvaluation } from '@/lib/types';

type ViewState = 'idle' | 'loading' | 'success' | 'error';

const JOB_CATEGORIES = [
  '軟體工程師',
  '前端工程師',
  '後端工程師',
  '全端工程師',
  '資料工程師',
  '資料科學家',
  'DevOps / SRE',
  '產品經理',
  'UI/UX 設計師',
  '專案管理',
  '行銷企劃',
  '業務銷售',
  '人資 HR',
  '財務會計',
  '其他',
];

const VERDICT_CONFIG = {
  strongly_recommend: {
    label: '強烈推薦',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: ThumbsUp,
  },
  recommend: {
    label: '推薦面試',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: CheckCircle2,
  },
  neutral: {
    label: '可列備選',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    icon: AlertTriangle,
  },
  not_recommend: {
    label: '不建議',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: XCircle,
  },
  strongly_not_recommend: {
    label: '完全不匹配',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: ThumbsDown,
  },
};

export function EvaluatorTool() {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<CandidateEvaluation | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const validExts = ['.pdf', '.txt', '.md', '.docx'];

    if (!validTypes.includes(selectedFile.type) && !validExts.includes(ext)) {
      setError('僅支援 PDF、TXT、DOCX、Markdown 格式');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('檔案大小不可超過 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleEvaluate = async () => {
    if (!file) {
      setError('請先上傳候選人履歷');
      return;
    }
    if (jobDescription.trim().length < 30) {
      setError('請提供至少 30 字的職缺描述');
      return;
    }

    setViewState('loading');
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('jobCategory', jobCategory);

    try {
      const res = await fetch('/api/evaluate', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success) {
        setResult(json.data);
        setViewState('success');
      } else {
        setError(json.error || '評估失敗');
        setViewState('error');
      }
    } catch {
      setError('網路錯誤，請稍後再試');
      setViewState('error');
    }
  };

  const handleReset = () => {
    setViewState('idle');
    setFile(null);
    setJobDescription('');
    setJobCategory('');
    setError('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {viewState !== 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-primary" />
              候選人評估
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              上傳候選人 CV 並提供職缺描述，AI 將從面試官角度評估適配度
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">候選人履歷 *</label>
              <div
                className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : file
                      ? 'border-green-300 bg-green-50'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('cv-upload')?.click()}
              >
                <input
                  id="cv-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      拖放或點擊上傳候選人 CV（PDF、DOCX、TXT）
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="jd-input" className="mb-1.5 block text-sm font-medium">
                職缺描述 (Job Description) *
              </label>
              <textarea
                id="jd-input"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={6}
                placeholder="貼上職缺描述，包含職責、技能要求、經驗年資等..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                至少 30 字。越詳細的 JD 評估結果越精準。
              </p>
            </div>

            {/* Job Category */}
            <div>
              <label htmlFor="category-select" className="mb-1.5 block text-sm font-medium">
                職缺類別（選填）
              </label>
              <select
                id="category-select"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
              >
                <option value="">請選擇...</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleEvaluate}
              disabled={viewState === 'loading' || !file}
            >
              {viewState === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 評估中...
                </>
              ) : (
                '開始評估候選人'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {viewState === 'loading' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">AI 正在評估候選人...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              分析履歷內容、比對職缺需求、產生面試建議
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {viewState === 'success' && result && (
        <EvaluationReport result={result} onReset={handleReset} />
      )}
    </div>
  );
}

// ── Evaluation Report ────────────────────────────────────────────────────────

function EvaluationReport({
  result,
  onReset,
}: {
  result: CandidateEvaluation;
  onReset: () => void;
}) {
  const verdictCfg = VERDICT_CONFIG[result.verdict];
  const VerdictIcon = verdictCfg.icon;

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <Card className={`border-2 ${verdictCfg.color}`}>
        <CardContent className="flex items-center gap-4 py-6">
          <VerdictIcon className="h-10 w-10" />
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold">{verdictCfg.label}</h2>
              <span className="text-3xl font-black">{result.overallScore}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
              <span className="rounded bg-white/80 px-2 py-0.5 text-sm font-medium">
                {result.scoreJustification.letterGrade}
              </span>
            </div>
            {result.candidateName && <p className="mt-1 text-sm">候選人：{result.candidateName}</p>}
          </div>
          <Button variant="outline" onClick={onReset}>
            評估下一位
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>總結評語</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{result.scoreJustification.summary}</p>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card>
        <CardHeader>
          <CardTitle>五維評估</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'technicalFit', label: '技術適配度', data: result.dimensions.technicalFit },
            {
              key: 'experienceRelevance',
              label: '經驗相關性',
              data: result.dimensions.experienceRelevance,
            },
            {
              key: 'achievementQuality',
              label: '成就品質',
              data: result.dimensions.achievementQuality,
            },
            { key: 'cultureFit', label: '文化適配度', data: result.dimensions.cultureFit },
            {
              key: 'growthPotential',
              label: '成長潛力',
              data: result.dimensions.growthPotential,
            },
          ].map(({ key, label, data }) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-bold">{data.score}/20</span>
              </div>
              <Progress value={(data.score / 20) * 100} className="mb-1" />
              <p className="text-xs text-muted-foreground">{data.analysis}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>技能評估</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SkillList title="高度匹配" items={result.skillsAssessment.strongMatches} color="green" />
          <SkillList
            title="部分匹配"
            items={result.skillsAssessment.partialMatches}
            color="yellow"
          />
          <SkillList
            title="缺少關鍵技能"
            items={result.skillsAssessment.missingCritical}
            color="red"
          />
          <SkillList title="額外加分" items={result.skillsAssessment.bonusSkills} color="blue" />
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>關鍵字比對</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-green-700">✓ 匹配的關鍵字</h4>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.matched.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-red-700">✗ 缺少的關鍵字</h4>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.missing.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Concerns */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ThumbsUp className="h-5 w-5" />
              候選人優勢
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.strengths.map((s, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              疑慮與紅旗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.concerns.map((c, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{c.title}</h4>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      c.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : c.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c.severity === 'high'
                      ? '高風險'
                      : c.severity === 'medium'
                        ? '中風險'
                        : '低風險'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Interview Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            建議面試問題
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.interviewQuestions.map((q, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    q.category === 'technical'
                      ? 'bg-purple-100 text-purple-700'
                      : q.category === 'behavioral'
                        ? 'bg-blue-100 text-blue-700'
                        : q.category === 'experience'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {q.category === 'technical'
                    ? '技術驗證'
                    : q.category === 'behavioral'
                      ? '行為面試'
                      : q.category === 'experience'
                        ? '經驗深挖'
                        : '資訊澄清'}
                </span>
              </div>
              <p className="text-sm font-medium">{q.question}</p>
              <p className="mt-1 text-xs text-muted-foreground">{q.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>招募洞察</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SkillList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: 'green' | 'yellow' | 'red' | 'blue';
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  if (!items.length) return null;

  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-2.5 py-0.5 text-xs ${colorMap[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
