import { Header } from '@/components/header';
import { EvaluatorTool } from '@/components/evaluator-tool';
import { FileText, Target, MessageSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            AI 候選人評估工具
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            面試官專用。上傳候選人 CV，AI 自動比對職缺需求，
            產生專業評估報告、面試問題建議，幫助你做出更好的招募決策。
          </p>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold">使用方式</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: FileText,
                title: '上傳 CV',
                desc: '上傳候選人的 PDF/DOCX 履歷',
              },
              {
                icon: Target,
                title: '貼上 JD',
                desc: '提供目標職缺描述',
              },
              {
                icon: BarChart3,
                title: 'AI 評估',
                desc: '五維度分析適配度',
              },
              {
                icon: MessageSquare,
                title: '面試建議',
                desc: '針對性面試問題產生',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-lg border p-6 text-center"
              >
                <Icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Evaluator Tool */}
        <section id="evaluator">
          <EvaluatorTool />
        </section>

        {/* Features */}
        <section id="features" className="mt-16 mb-12">
          <h2 className="mb-6 text-center text-2xl font-bold">功能特色</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="五維度評估"
              desc="技術適配、經驗相關性、成就品質、文化適配、成長潛力 — 全面評估候選人"
            />
            <FeatureCard
              title="紅旗偵測"
              desc="自動識別短期跳槽、職涯空窗、誇大嫌疑等潛在風險"
            />
            <FeatureCard
              title="面試問題建議"
              desc="根據候選人履歷生成技術驗證、行為面試、經驗深挖等針對性問題"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} InterviewerHelp. All rights reserved.
        </footer>
      </main>
    </>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
