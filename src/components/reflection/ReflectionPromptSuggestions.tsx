
import React from 'react';
import { Sparkles } from 'lucide-react';

interface ReflectionPromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const ReflectionPromptSuggestions: React.FC<ReflectionPromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const prompts = [
    "Today, I noticed my energy was ___ during meditation. I felt this specifically in my ___ chakra(s).",
    "The most profound insight from my energy practice today was ___ which made me realize ___.",
    "I'm working on balancing my ___ chakra. Today I noticed ___ which suggests ___.",
    "During my breathwork today, I experienced ___ sensation, which revealed ___ about my energy body.",
    "I've been focusing on cultivating ___ energy, and today I noticed ___ changes in how I feel.",
    "My consciousness feels different today because ___. I think this relates to my practice of ___.",
    "I'm struggling with ___ energy pattern. Today I tried ___ approach to transform it."
  ];

  return (
    <div className="mb-4 bg-black/20 p-3 rounded-lg border border-white/10">
      <div className="flex items-center mb-2">
        <Sparkles size={14} className="text-quantum-400 mr-1" />
        <span className="text-xs text-white/80">Reflection Prompts</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            className="text-left text-xs p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReflectionPromptSuggestions;
