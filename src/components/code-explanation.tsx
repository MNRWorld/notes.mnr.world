'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Bot } from 'lucide-react';

interface CodeExplanationProps {
  explanation: string;
  isLoading: boolean;
}

export function CodeExplanation({ explanation, isLoading }: CodeExplanationProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BrainCircuit />
          Code Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {isLoading && (
            <div className="space-y-4 p-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
          {!isLoading && explanation && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
              {explanation}
            </div>
          )}
          {!isLoading && !explanation && (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
              <Bot className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p>Your code's explanation will appear here.</p>
              <p className="text-xs mt-2">Write some code and click "Explain Code".</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
