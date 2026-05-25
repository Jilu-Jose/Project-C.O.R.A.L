import { useState, useEffect } from 'react';

export const useTypewriter = (text, speed = 18) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    // Fast forward if the current text is just an appended version of displayedText
    if (text.startsWith(displayedText)) {
      i = displayedText.length;
    } else {
      setDisplayedText('');
      i = 0;
    }

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (i < text.length) {
          const nextChar = text.charAt(i);
          i++;
          return prev + nextChar;
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]); // Intentionally omitting displayedText from dependencies to avoid infinite loops

  return displayedText;
};
