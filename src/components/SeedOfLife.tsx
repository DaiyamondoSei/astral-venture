
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import CategoryIcon from './CategoryIcon';
import { 
  Brain, Flame, Heart, Globe, Moon, Sparkles, Star, 
  Sun, Zap, Flower, Eye, Cloud, Compass
} from 'lucide-react';

interface SeedOfLifeProps {
  className?: string;
  onCategorySelect?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  position: string;
  description: string;
  color: string;
}

const SeedOfLife = ({ className, onCategorySelect }: SeedOfLifeProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories: Category[] = [
    {
      id: 'meditation',
      name: 'Meditation',
      icon: <Brain size={24} />,
      position: 'top-0 left-1/2 -translate-x-1/2',
      description: 'Master the art of presence and stillness',
      color: 'from-quantum-300 to-quantum-600'
    },
    {
      id: 'energy',
      name: 'Energy Work',
      icon: <Flame size={24} />,
      position: 'top-[14.6%] right-[14.6%] translate-x-1/2 -translate-y-1/2',
      description: 'Learn to sense and direct subtle energies',
      color: 'from-ethereal-300 to-ethereal-600'
    },
    {
      id: 'connection',
      name: 'Connection',
      icon: <Heart size={24} />,
      position: 'right-0 top-1/2 translate-y-[-50%]',
      description: 'Develop deeper connections with others',
      color: 'from-ethereal-400 to-ethereal-600'
    },
    {
      id: 'astral',
      name: 'Astral Travel',
      icon: <Globe size={24} />,
      position: 'bottom-[14.6%] right-[14.6%] translate-x-1/2 translate-y-1/2',
      description: 'Explore beyond physical limitations',
      color: 'from-astral-300 to-astral-600'
    },
    {
      id: 'dreams',
      name: 'Lucid Dreams',
      icon: <Moon size={24} />,
      position: 'bottom-0 left-1/2 -translate-x-1/2',
      description: 'Master consciousness during sleep',
      color: 'from-quantum-400 to-quantum-700'
    },
    {
      id: 'manifestation',
      name: 'Manifestation',
      icon: <Sparkles size={24} />,
      position: 'bottom-[14.6%] left-[14.6%] -translate-x-1/2 translate-y-1/2',
      description: 'Create your reality through intention',
      color: 'from-astral-300 to-quantum-500'
    },
    {
      id: 'intention',
      name: 'Intention',
      icon: <Star size={24} />,
      position: 'left-0 top-1/2 translate-y-[-50%]',
      description: 'Focus your mind on desired outcomes',
      color: 'from-astral-400 to-astral-600'
    },
    {
      id: 'chakras',
      name: 'Chakras',
      icon: <Sun size={24} />,
      position: 'top-[14.6%] left-[14.6%] -translate-x-1/2 -translate-y-1/2',
      description: 'Balance your energy centers',
      color: 'from-ethereal-300 to-astral-500'
    },
    {
      id: 'quantum',
      name: 'Quantum Field',
      icon: <Zap size={24} />,
      position: 'top-1/3 left-1/2 -translate-x-1/2',
      description: 'Understand the nature of reality',
      color: 'from-quantum-300 to-quantum-600'
    },
    {
      id: 'healing',
      name: 'Energy Healing',
      icon: <Flower size={24} />,
      position: 'top-1/2 right-1/3 translate-y-[-50%]',
      description: 'Channel healing energies for wellbeing',
      color: 'from-ethereal-300 to-ethereal-600'
    },
    {
      id: 'awareness',
      name: 'Awareness',
      icon: <Eye size={24} />,
      position: 'bottom-1/3 right-1/2 translate-x-1/2',
      description: 'Expand your perception of reality',
      color: 'from-astral-300 to-astral-600'
    },
    {
      id: 'breathwork',
      name: 'Breathwork',
      icon: <Cloud size={24} />,
      position: 'bottom-1/2 left-1/3 translate-y-[50%]',
      description: 'Master your breath to control energy',
      color: 'from-quantum-400 to-quantum-600'
    },
    {
      id: 'guidance',
      name: 'Inner Guidance',
      icon: <Compass size={24} />,
      position: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      description: 'Connect with your higher wisdom',
      color: 'from-quantum-300 to-astral-500'
    },
  ];

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    if (onCategorySelect) {
      onCategorySelect(id);
    }
  };

  return (
    <div className={cn("seed-of-life relative", className)}>
      <div className="absolute w-full h-full rounded-full border border-white/20 animate-pulse-glow"></div>
      
      {/* Center flower of life pattern - subtle background */}
      <div className="absolute w-full h-full opacity-10">
        <div className="w-full h-full rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 left-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 right-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 left-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 right-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 left-1/2 -translate-x-1/2 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 left-1/2 -translate-x-1/2 rounded-full border border-white/30"></div>
      </div>
      
      {categories.map((category) => (
        <div 
          key={category.id}
          className={cn(
            "seed-of-life-circle",
            category.position,
            activeCategory === category.id ? "z-10" : "z-0"
          )}
        >
          <CategoryIcon 
            id={category.id}
            name={category.name}
            icon={category.icon}
            description={category.description}
            gradientColor={category.color}
            isActive={activeCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default SeedOfLife;
