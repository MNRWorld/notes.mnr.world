import { useEffect, useState } from 'react';

interface KeyboardState {
  isVisible: boolean;
  height: number;
}

export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let initialViewportHeight = window.innerHeight;
    
    const updateKeyboardState = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Consider keyboard visible if height decreased by more than 150px
      const isKeyboardVisible = heightDifference > 150;
      
      setKeyboardState({
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? heightDifference : 0,
      });
    };

    // Visual Viewport API (modern browsers)
    if ('visualViewport' in window && window.visualViewport) {
      const visualViewport = window.visualViewport;
      
      const handleVisualViewportChange = () => {
        const keyboardHeight = window.innerHeight - visualViewport.height;
        setKeyboardState({
          isVisible: keyboardHeight > 150,
          height: keyboardHeight > 150 ? keyboardHeight : 0,
        });
      };
      
      visualViewport.addEventListener('resize', handleVisualViewportChange);
      
      return () => {
        visualViewport.removeEventListener('resize', handleVisualViewportChange);
      };
    } else {
      // Fallback for older browsers
      const handleResize = updateKeyboardState;
      const handleFocusIn = updateKeyboardState;
      const handleFocusOut = () => {
        setTimeout(() => {
          setKeyboardState({ isVisible: false, height: 0 });
        }, 300);
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('focusin', handleFocusIn);
      window.addEventListener('focusout', handleFocusOut);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('focusin', handleFocusIn);
        window.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, []);

  return keyboardState;
};
