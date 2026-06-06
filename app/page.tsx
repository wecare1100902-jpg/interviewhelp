import { Header } from '@/components/header';
import { EvaluatorTool } from '@/components/evaluator-tool';
import {
  FileText,
  Target,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Brain,
  ArrowDown,
  CheckCircle,
  Github,
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient">
          {/* Decorative dots */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, hsl(221 83% 53% / 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-center">
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                AI 驅動的招募決策輔助
              </div>
              <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                讓每一場面試
                <br />
                <span className="text-gradient">更有洞察力</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                面試官專用 AI 評估工具。上傳候選人 CV，自動比對職缺需求，
                產生五維度專業評估報告與面試問題建議。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#evaluator"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <BarChart3 className="h-5 w-5" />
                  立即開始評估
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
                >
                  了解更多
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight">簡單四步驟</h2>
              <p className="text-lg text-muted-foreground">從上傳到洞察，只需幾分鐘</p>
            </div>
            <div className="stagger-children grid gap-6 sm:gap-8 md:grid-cols-4">
              {[
                {
                  icon: FileText,
                  title: '上傳 CV',
                  desc: '支援 PDF、DOCX、TXT 格式的候選人履歷',
                  step: 1,
                },
                {
                  icon: Target,
                  title: '貼上 JD',
                  desc: '提供目標職缺描述，越詳細越精準',
                  step: 2,
                },
                {
                  icon: Brain,
                  title: 'AI 深度評估',
                  desc: '五維度分析候選人與職缺的適配度',
                  step: 3,
                },
                {
                  icon: MessageSquare,
                  title: '面試建議',
                  desc: '獲得針對性面試問題與招募洞察',
                  step: 4,
                },
              ].map(({ icon: Icon, title, desc, step }) => (
                <div
                  key={title}
                  className="card-hover group relative flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm"
                >
                  <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {step}
                  </div>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Evaluator Tool */}
        <section id="evaluator" className="py-20 sm:py-24 hero-gradient">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight">候選人評估</h2>
              <p className="text-lg text-muted-foreground">上傳履歷，AI 為你產生全面的專業評估報告</p>
            </div>
            <EvaluatorTool />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-14 text-center">
              <h2 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight">功能特色</h2>
              <p className="text-lg text-muted-foreground">專為面試官與招募經理打造的 AI 工具</p>
            </div>
            <div className="stagger-children grid gap-6 sm:gap-8 md:grid-cols-3">
              <FeatureCard
                icon={BarChart3}
                title="五維度評估"
                desc="技術適配、經驗相關性、成就品質、文化適配、成長潛力 — 全方位評估每位候選人"
                highlights={['0-100 精確評分', '等第制校準', '維度雷達分析']}
              />
              <FeatureCard
                icon={Shield}
                title="紅旗偵測"
                desc="自動識別短期跳槽、職涯空窗、誇大嫌疑等潛在風險，降低招募失誤率"
                highlights={['風險等級分類', '自動標記疑點', '數據支撐判斷']}
              />
              <FeatureCard
                icon={MessageSquare}
                title="面試問題建議"
                desc="根據候選人履歷生成技術驗證、行為面試、經驗深挖等針對性問題"
                highlights={['STAR 行為面試', '技術驗證問題', '經驗深挖方向']}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© {new Date().getFullYear()} InterviewerHelp</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">AI-Powered Hiring Assistant</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/wecare1100902-jpg/interviewhelp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  highlights,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  highlights: string[];
}) {
  return (
    <div className="card-hover flex flex-col rounded-2xl border bg-card p-8 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <ul className="mt-auto space-y-1.5">
        {highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-success" />
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
