
import React from 'react';
import { CodeBlock } from './CodeBlock';

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  // Split by code blocks first
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {blocks.map((block, index) => {
        if (block.startsWith('```')) {
          const match = block.match(/```(\w*)\n?([\s\S]*?)\n?```/);
          if (match) {
            const [, language, code] = match;
            return <CodeBlock key={index} language={language} code={code} />;
          }
        }

        // Process simple markdown for non-code parts (bold)
        const textParts = block.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={index} className="whitespace-pre-wrap">
            {textParts.map((text, tIdx) => {
              if (text.startsWith('**') && text.endsWith('**')) {
                return <strong key={tIdx} className="font-black">{text.slice(2, -2)}</strong>;
              }
              return <span key={tIdx}>{text}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};
