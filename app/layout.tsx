import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InterviewerHelp — AI 候選人評估工具',
  description:
    '面試官專用的 AI 履歷評估工具。上傳候選人 CV，自動比對職缺需求，產生專業評估報告與面試問題建議。',
  keywords: ['面試官工具', '候選人評估', 'AI 履歷分析', '招募工具', '人才篩選'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
