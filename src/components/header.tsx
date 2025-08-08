'use client';

import { Sun, Moon, Palette, BrainCircuit, Download, Languages, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type Theme = 'light' | 'dark' | 'dracula';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: string;
  setLanguage: (language:string) => void;
  onExplain: () => void;
  onDownload: () => void;
  isExplanationLoading: boolean;
}

export function Header({
  theme,
  setTheme,
  language,
  setLanguage,
  onExplain,
  onDownload,
  isExplanationLoading,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-2 border-b shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <Code className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          CodeCanvas
        </h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Button onClick={onExplain} disabled={isExplanationLoading} variant="outline">
          <BrainCircuit className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">{isExplanationLoading ? 'Explaining...' : 'Explain Code'}</span>
        </Button>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-auto sm:w-[150px]">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <SelectValue placeholder="Language" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
          </SelectContent>
        </Select>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onDownload} variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download code</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download Code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              {theme === 'light' && <Sun className="h-5 w-5" />}
              {theme === 'dark' && <Moon className="h-5 w-5" />}
              {theme === 'dracula' && <Palette className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dracula')}>Dracula</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
