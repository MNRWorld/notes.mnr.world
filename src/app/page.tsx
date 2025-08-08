'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { CodeEditor } from '@/components/code-editor';
import { CodeExplanation } from '@/components/code-explanation';
import { explainCode, type ExplainCodeInput } from '@/ai/flows/explain-code';
import type { Theme } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

const sampleCode = `import React from 'react';

// A simple React component
function Greeting({ name }) {
  const message = \`Hello, \${name}!\`;

  return (
    <div className="greeting-container">
      <h1>{message}</h1>
      <p>Welcome to CodeCanvas.</p>
    </div>
  );
}

export default Greeting;`;

export default function Home() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [code, setCode] = useState(sampleCode);
  const [language, setLanguage] = useState('javascript');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('codecanvas-theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('codecanvas-theme', theme);
  }, [theme]);

  const handleExplain = async () => {
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Code editor is empty. Please enter some code to explain.',
      });
      return;
    }
    setIsLoading(true);
    setExplanation('');
    try {
      const input: ExplainCodeInput = { code, language };
      const result = await explainCode(input);
      setExplanation(result.explanation);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get explanation. Please check the console for details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const extensionMap: { [key: string]: string } = {
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      typescript: 'ts',
    };
    const extension = extensionMap[language] || 'txt';
    a.download = `code.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        onExplain={handleExplain}
        onDownload={handleDownload}
        isExplanationLoading={isLoading}
      />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6 overflow-hidden">
        <div className="flex flex-col min-h-0">
          <CodeEditor
            code={code}
            onCodeChange={setCode}
            language={language}
          />
        </div>
        <div className="flex flex-col min-h-0">
          <CodeExplanation
            explanation={explanation}
            isLoading={isLoading}
          />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
