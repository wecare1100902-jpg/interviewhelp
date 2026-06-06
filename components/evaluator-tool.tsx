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
  RotateCcw,
  Lightbulb,
  ChevronRight,
  Search,
  Sparkles,
  X,
  Target,
  Brain,
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
    sublabel: '務必安排面試',
    color: 'text-green-700 bg-green-50 border-green-200',
    ringColor: 'stroke-green-500',
    icon: ThumbsUp,
  },
  recommend: {
    label: '推薦面試',
    sublabel: '值得安排面試',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    ringColor: 'stroke-blue-500',
    icon: CheckCircle2,
  },
  neutral: {
    label: '可列備選',
    sublabel: '有條件考慮',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    ringColor: 'stroke-yellow-500',
    icon: AlertTriangle,
  },
  not_recommend: {
    label: '不建議',
    sublabel: '適配度偏低',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    ringColor: 'stroke-orange-500',
    icon: XCircle,
  },
  strongly_not_recommend: {
    label: '完全不匹配',
    sublabel: '建議跳過',
    color: 'text-red-700 bg-red-50 border-red-200',
    ringColor: 'stroke-red-500',
    icon: ThumbsDown,
  },
};

const LOADING_STEPS = [
  { label: '解析履歷內容', duration: 2000 },
  { label: '比對職缺需求', duration: 3000 },
  { label: '分析技能適配度', duration: 4000 },
  { label: '產生面試建議', duration: 3000 },
  { label: '撰寫評估報告', duration: 2000 },
];

export function EvaluatorTool() {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<CandidateEvaluation | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

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
    setLoadingStep(0);

    // Animate loading steps
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step);
      } else {
        clearInterval(stepInterval);
      }
    }, 2500);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('jobCategory', jobCategory);

    try {
      const res = await fetch('/api/evaluate', { method: 'POST', body: formData });
      const json = await res.json();

      clearInterval(stepInterval);

      if (json.success) {
        setResult(json.data);
        setViewState('success');
      } else {
        setError(json.error || '評估失敗');
        setViewState('error');
      }
    } catch {
      clearInterval(stepInterval);
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
    setLoadingStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      {viewState !== 'success' && (
        <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">開始評估</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  上傳候選人 CV 並提供職缺描述，AI 將從面試官角度進行深度分析
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            {/* File Upload */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                候選人履歷
                <span className="text-destructive">*</span>
              </label>
              <div
                className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
                  dragOver
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : file
                      ? 'border-green-300 bg-green-50/50'
                      : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/[0.02]'
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
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-green-700">{file.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB · 點擊更換檔案
                      </p>
                    </div>
                    <button
                      type="button"
                      className="absolute top-3 right-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">拖放檔案或點擊上傳</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        支援 PDF、DOCX、TXT、Markdown（最大 10MB）
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="jd-input" className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Target className="h-4 w-4 text-muted-foreground" />
                職缺描述 (Job Description)
                <span className="text-destructive">*</span>
              </label>
              <textarea
                id="jd-input"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-colors"
                rows={7}
                placeholder="貼上職缺描述，包含：&#10;• 職責與工作內容&#10;• 必備技能與經驗要求&#10;• 加分條件&#10;• 經驗年資要求"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  至少 30 字。越詳細的 JD 評估結果越精準。
                </p>
                <span className={`text-xs ${jobDescription.length >= 30 ? 'text-success' : 'text-muted-foreground'}`}>
                  {jobDescription.length} 字
                </span>
              </div>
            </div>

            {/* Job Category */}
            <div>
              <label htmlFor="category-select" className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                職缺類別
                <span className="text-xs text-muted-foreground font-normal">（選填）</span>
              </label>
              <select
                id="category-select"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-colors"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
              >
                <option value="">請選擇職缺類別...</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 animate-scale-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25"
              size="lg"
              onClick={handleEvaluate}
              disabled={viewState === 'loading' || !file}
            >
              {viewState === 'loading' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI 評估中...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  開始評估候選人
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {viewState === 'loading' && (
        <Card className="overflow-hidden border-0 shadow-xl shadow-primary/5 animate-scale-in">
          <CardContent className="py-16 px-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary animate-pulse-soft" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">AI 正在深度分析</h3>
              <p className="mb-8 text-sm text-muted-foreground">
                比對候選人履歷與職缺需求，產生專業評估報告
              </p>
              <div className="w-full max-w-sm space-y-3">
                {LOADING_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500 ${
                      i < loadingStep
                        ? 'bg-green-50 text-green-700'
                        : i === loadingStep
                          ? 'bg-primary/5 text-primary'
                          : 'text-muted-foreground/50'
                    }`}
                  >
                    {i < loadingStep ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : i === loadingStep ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-current opacity-30" />
                    )}
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
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

// ── Score Ring SVG ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 120, strokeWidth = 8, className = '' }: {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 90 ? 'stroke-green-500' :
    score >= 78 ? 'stroke-blue-500' :
    score >= 60 ? 'stroke-yellow-500' :
    score >= 40 ? 'stroke-orange-500' : 'stroke-red-500';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          className={`${color} score-ring`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
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
    <div className="space-y-6 animate-fade-in">
      {/* Verdict Banner */}
      <Card className={`overflow-hidden border-2 ${verdictCfg.color}`}>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
            <ScoreRing score={result.overallScore} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <VerdictIcon className="h-7 w-7" />
                  <h2 className="text-2xl font-bold">{verdictCfg.label}</h2>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold shadow-sm">
                  {result.scoreJustification.letterGrade}
                </span>
              </div>
              <p className="text-sm opacity-80">{verdictCfg.sublabel}</p>
              {result.candidateName && (
                <p className="mt-2 text-sm font-medium">候選人：{result.candidateName}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
              className="shrink-0 rounded-xl gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              評估下一位
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            總結評語
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">{result.scoreJustification.summary}</p>
        </CardContent>
      </Card>

      {/* Dimension Scores */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            五維評估
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { key: 'technicalFit', label: '技術適配度', emoji: '💻', data: result.dimensions.technicalFit },
            { key: 'experienceRelevance', label: '經驗相關性', emoji: '📋', data: result.dimensions.experienceRelevance },
            { key: 'achievementQuality', label: '成就品質', emoji: '🏆', data: result.dimensions.achievementQuality },
            { key: 'cultureFit', label: '文化適配度', emoji: '🤝', data: result.dimensions.cultureFit },
            { key: 'growthPotential', label: '成長潛力', emoji: '🚀', data: result.dimensions.growthPotential },
          ].map(({ key, label, emoji, data }) => (
            <div key={key} className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span>{emoji}</span>
                  {label}
                </span>
                <span className={`text-sm font-bold ${
                  data.score >= 16 ? 'text-green-600' :
                  data.score >= 12 ? 'text-blue-600' :
                  data.score >= 8 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.score} / 20
                </span>
              </div>
              <Progress value={(data.score / 20) * 100} className="mb-2 h-2.5" />
              <p className="text-xs leading-relaxed text-muted-foreground">{data.analysis}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            技能評估
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <SkillList title="✅ 高度匹配" items={result.skillsAssessment.strongMatches} color="green" />
          <SkillList title="🔶 部分匹配" items={result.skillsAssessment.partialMatches} color="yellow" />
          <SkillList title="❌ 缺少關鍵技能" items={result.skillsAssessment.missingCritical} color="red" />
          <SkillList title="⭐ 額外加分" items={result.skillsAssessment.bonusSkills} color="blue" />
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            關鍵字比對
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              匹配的關鍵字
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs">{result.keywords.matched.length}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywords.matched.map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
              <XCircle className="h-4 w-4" />
              缺少的關鍵字
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs">{result.keywords.missing.length}</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywords.missing.map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-800"
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
        <Card className="border-0 shadow-lg shadow-primary/5">
          <CardHeader className="border-b bg-green-50/50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ThumbsUp className="h-5 w-5" />
              候選人優勢
            </CardTitle>
          </CardHeader>
          <CardContent className="stagger-children space-y-4 pt-6">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex gap-3">
                <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                <div>
                  <h4 className="text-sm font-semibold">{s.title}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-primary/5">
          <CardHeader className="border-b bg-orange-50/50">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              疑慮與紅旗
            </CardTitle>
          </CardHeader>
          <CardContent className="stagger-children space-y-4 pt-6">
            {result.concerns.map((c, i) => (
              <div key={i} className="flex gap-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-orange-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{c.title}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : c.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.severity === 'high'
                        ? '高風險'
                        : c.severity === 'medium'
                          ? '中風險'
                          : '低風險'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Interview Questions */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            建議面試問題
          </CardTitle>
        </CardHeader>
        <CardContent className="stagger-children space-y-4 pt-6">
          {result.interviewQuestions.map((q, i) => (
            <div key={i} className="rounded-xl border p-5 transition-colors hover:bg-muted/20">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
              <p className="text-sm font-medium leading-relaxed">{q.question}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            招募洞察
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Bottom Action */}
      <div className="flex justify-center pb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="rounded-xl gap-2 px-8"
        >
          <RotateCcw className="h-4 w-4" />
          評估下一位候選人
        </Button>
      </div>
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
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  if (!items.length) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-lg border px-3 py-1 text-xs font-medium ${colorMap[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
