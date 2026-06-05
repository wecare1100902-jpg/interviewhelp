import { UserCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">InterviewerHelp</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">
            使用方式
          </a>
          <a href="#features" className="text-muted-foreground hover:text-foreground">
            功能特色
          </a>
        </nav>
      </div>
    </header>
  );
}
