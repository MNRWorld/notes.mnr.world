
"use client";

import React from "react";
import { EditorJS } from "@editorjs/editorjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Heading } from "lucide-react";

interface FloatingMenuProps {
  editor: EditorJS;
  position: { top: number; left: number; right: number };
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ editor, position }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.execCommand("formatBlock", "H" + level);
  };

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: `${position.top - 50}px`,
    left: `${position.left + (position.right - position.left) / 2}px`,
    transform: "translateX(-50%)",
    zIndex: 10,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="flex items-center gap-1 rounded-md bg-background p-1 shadow-lg border"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Heading className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setHeading(1)}>
            হেডিং ১
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading(2)}>
            হেডিং ২
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading(3)}>
            হেডিং ৩
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading(4)}>
            হেডিং ৪
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading(5)}>
            হেডিং ৫
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading(6)}>
            হেডিং ৬
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingMenu;
