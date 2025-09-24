"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApiKeyStore } from "@/stores/use-api-key-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export function ApiKeyManager() {
  const { apiKey, setApiKey, setSkipped } = useApiKeyStore();
  const [currentApiKey, setCurrentApiKey] = useState(apiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    setApiKey(currentApiKey);
    setSkipped(false); // Reset skip state when API key is set
    toast.success("API কী সফলভাবে সংরক্ষিত হয়েছে!");
  };

  const handleRemove = () => {
    setApiKey("");
    setCurrentApiKey("");
    setSkipped(false); // Reset skip state when API key is removed
    toast.success("API কী সরিয়ে দেওয়া হয়েছে।");
  };

  return (
    <div className="flex flex-col justify-between rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="mb-3 flex-1 space-y-1 sm:mb-0">
        <p className="flex items-center gap-2 font-medium">
          <Icons.Key className="h-4 w-4" /> Gemini API কী
        </p>
        <div className="relative">
          <Input
            type={showApiKey ? "text" : "password"}
            placeholder="কোনো API কী সেট করা নেই"
            value={currentApiKey}
            onChange={(e) => setCurrentApiKey(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <Icons.EyeOff className="h-4 w-4" />
            ) : (
              <Icons.Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {apiKey && (
          <Button variant="destructive" size="sm" onClick={handleRemove}>
            সরান
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={currentApiKey === apiKey}
        >
          সংরক্ষণ
        </Button>
      </div>
    </div>
  );
}
