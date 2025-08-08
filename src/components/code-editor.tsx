'use client';

import React, { useMemo, useRef, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

const highlightCode = (code: string): string => {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|from|export|default|new|class|extends|super|async|await|try|catch|finally|switch|case|break|continue|debugger|delete|do|in|instanceof|typeof|void|with|yield|enum|implements|interface|package|private|protected|public|static|of|get|set)\b/g, '<span style="color:#ff79c6">$1</span>')
    .replace(/\b(true|false|null|undefined|this|React)\b/g, '<span style="color:#bd93f9">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span style="color:#6272a4">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span style="color:#f1fa8c">$1$2$1</span>')
    .replace(/(\d+\.?\d*)/g, '<span style="color:#ffb86c">$1</span>')
    .replace(/([A-Z][a-zA-Z0-9_]*)/g, '<span style="color:#8be9fd">$1</span>')
    .replace(/([{}()[\]])/g, '<span style="color:#f8f8f2">$1</span>');
};

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  language?: string;
  className?: string;
}

export function CodeEditor({ code, onCodeChange, language = 'javascript', className }: CodeEditorProps) {
  const lines = useMemo(() => code.split('\n').length, [code]);
  const highlightedCode = useMemo(() => highlightCode(code) + '\n', [code]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(e.target.value);
  };

  const extensionMap: { [key: string]: string } = {
    javascript: 'js',
    python: 'py',
    html: 'html',
    css: 'css',
    typescript: 'ts',
  };
  const extension = extensionMap[language] || 'txt';


  return (
    <div className={cn("bg-[#282a36] rounded-lg shadow-lg font-code border border-slate-700 flex-1 flex flex-col overflow-hidden", className)}>
        <div className="px-4 py-2 bg-[#21222C] flex items-center justify-between border-b border-slate-700 text-xs text-slate-400">
            <span>{`code.${extension}`}</span>
        </div>
        <div className="flex text-sm flex-1 overflow-hidden">
            <div
                ref={lineNumbersRef}
                className="text-right text-slate-500 select-none p-4 pt-3 font-mono bg-[#282a36] overflow-y-hidden shrink-0"
                aria-hidden="true"
            >
                {Array.from({ length: lines }, (_, i) => (
                    <div key={i} className="leading-relaxed h-[21px]">{i + 1}</div>
                ))}
            </div>
            <div className="relative flex-1">
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    onScroll={syncScroll}
                    spellCheck="false"
                    wrap="off"
                    className="absolute inset-0 w-full h-full p-4 pt-3 bg-transparent text-transparent caret-white resize-none font-mono leading-relaxed outline-none border-none z-10"
                    style={{ WebkitTextFillColor: 'transparent' }}
                />
                <pre
                    ref={preRef}
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full p-4 pt-3 text-[#f8f8f2] pointer-events-none overflow-hidden"
                >
                    <code className="leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
            </div>
        </div>
    </div>
  );
}
