
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { AIResponseDisplayProps } from './types';

export function AIResponseDisplay({ response }: AIResponseDisplayProps) {
  // Handle different response types
  if (!response) return null;

  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-800">
      {response.type === 'markdown' ? (
        <ReactMarkdown className="prose dark:prose-invert max-w-none">
          {response.answer}
        </ReactMarkdown>
      ) : response.type === 'code' ? (
        <pre className="p-3 bg-gray-100 dark:bg-gray-900 overflow-x-auto rounded">
          <code>{response.answer}</code>
        </pre>
      ) : (
        <div>
          {response.answer.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-2">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {response.suggestedPractices && response.suggestedPractices.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Suggested Practices:</h4>
          <ul className="pl-5 list-disc">
            {response.suggestedPractices.map((practice, idx) => (
              <li key={idx} className="text-sm">{practice}</li>
            ))}
          </ul>
        </div>
      )}

      {response.meta && (
        <div className="text-xs text-gray-500 mt-4">
          <p>
            Processed with {response.meta.model} in {response.meta.processingTime}ms
            {response.meta.cached && ' (cached)'}
          </p>
        </div>
      )}
    </Card>
  );
}
