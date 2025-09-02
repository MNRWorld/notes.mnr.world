"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suggestPersonalizedGreetings } from "@/ai/flows/personalized-greeting-suggestions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [message, setMessage] = useState("Hello World");
  const [displayKey, setDisplayKey] = useState(0);

  const [customInput, setCustomInput] = useState("");

  const [themeInput, setThemeInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateMessage = () => {
    if (customInput.trim()) {
      setMessage(customInput.trim());
      setDisplayKey((prev) => prev + 1);
    }
  };

  const handleGenerateGreetings = async () => {
    if (!themeInput.trim()) return;
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestPersonalizedGreetings({ theme: themeInput });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI greeting generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate greetings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setDisplayKey((prev) => prev + 1);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline font-bold text-primary">
            Hello World Showcase
          </CardTitle>
          <CardDescription>
            Customize your greeting or get AI-powered suggestions!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 pt-2">
          <div
            key={displayKey}
            className="animate-in fade-in-0 duration-700 w-full"
          >
            <h1 className="text-5xl font-bold text-center text-foreground font-headline tracking-tight py-8 break-words">
              {message}
            </h1>
          </div>

          <div className="w-full space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Customize Your Message
              </h3>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter your message..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateMessage()}
                  className="bg-card focus-visible:ring-accent"
                />
                <Button onClick={handleUpdateMessage}>Update</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Generate Greetings with AI
              </h3>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter a theme (e.g., 'space', 'pirates')"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleGenerateGreetings()
                  }
                  className="bg-card focus-visible:ring-accent"
                />
                <Button
                  onClick={handleGenerateGreetings}
                  disabled={isLoading}
                  variant="secondary"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-3 animate-in fade-in-0 duration-500">
                <h4 className="text-md font-medium text-muted-foreground">
                  Click a suggestion to use it:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(s)}
                      className="transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent focus:bg-accent focus:text-accent-foreground"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
