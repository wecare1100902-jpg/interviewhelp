import Link from 'next/link';
import { UserCheck, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient-strong shadow-sm">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight">InterviewerHelp</span>
            <Sparkles className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            使用方式
          </a>
          <a
            href="#features"
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            功能特色
          </a>
          <a
            href="#evaluator"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            開始評估
          </a>
        </nav>
      </div>
    </header>
  );
}
