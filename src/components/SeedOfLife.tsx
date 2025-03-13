import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  unlocked?: boolean;
}

const SeedOfLife = ({ className, onCategorySelect }: SeedOfLifeProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  
  const categories: Category[] = [
    {
      id: 'meditation',
      name: 'Meditation',
      icon: <Brain size={24} />,
      position: 'top-0 left-1/2 -translate-x-1/2',
      description: 'Master the art of presence and stillness',
      color: 'from-quantum-300 to-quantum-600',
      unlocked: true
    },
    {
      id: 'energy',
      name: 'Energy Work',
      icon: <Flame size={24} />,
      position: 'top-[14.6%] right-[14.6%] translate-x-1/2 -translate-y-1/2',
      description: 'Learn to sense and direct subtle energies',
      color: 'from-ethereal-300 to-ethereal-600',
      unlocked: true
    },
    {
      id: 'connection',
      name: 'Connection',
      icon: <Heart size={24} />,
      position: 'right-0 top-1/2 translate-y-[-50%]',
      description: 'Develop deeper connections with others',
      color: 'from-ethereal-400 to-ethereal-600',
      unlocked: true
    },
    {
      id: 'astral',
      name: 'Astral Travel',
      icon: <Globe size={24} />,
      position: 'bottom-[14.6%] right-[14.6%] translate-x-1/2 translate-y-1/2',
      description: 'Explore beyond physical limitations',
      color: 'from-astral-300 to-astral-600',
      unlocked: true
    },
    {
      id: 'dreams',
      name: 'Lucid Dreams',
      icon: <Moon size={24} />,
      position: 'bottom-0 left-1/2 -translate-x-1/2',
      description: 'Master consciousness during sleep',
      color: 'from-quantum-400 to-quantum-700',
      unlocked: true
    },
    {
      id: 'manifestation',
      name: 'Manifestation',
      icon: <Sparkles size={24} />,
      position: 'bottom-[14.6%] left-[14.6%] -translate-x-1/2 translate-y-1/2',
      description: 'Create your reality through intention',
      color: 'from-astral-300 to-quantum-500',
      unlocked: true
    },
    {
      id: 'intention',
      name: 'Intention',
      icon: <Star size={24} />,
      position: 'left-0 top-1/2 translate-y-[-50%]',
      description: 'Focus your mind on desired outcomes',
      color: 'from-astral-400 to-astral-600',
      unlocked: true
    },
    {
      id: 'chakras',
      name: 'Chakras',
      icon: <Sun size={24} />,
      position: 'top-[14.6%] left-[14.6%] -translate-x-1/2 -translate-y-1/2',
      description: 'Balance your energy centers',
      color: 'from-ethereal-300 to-astral-500',
      unlocked: true
    },
    {
      id: 'quantum',
      name: 'Quantum Field',
      icon: <Zap size={24} />,
      position: 'top-1/3 left-1/2 -translate-x-1/2',
      description: 'Understand the nature of reality',
      color: 'from-quantum-300 to-quantum-600',
      unlocked: false
    },
    {
      id: 'healing',
      name: 'Energy Healing',
      icon: <Flower size={24} />,
      position: 'top-1/2 right-1/3 translate-y-[-50%]',
      description: 'Channel healing energies for wellbeing',
      color: 'from-ethereal-300 to-ethereal-600',
      unlocked: false
    },
    {
      id: 'awareness',
      name: 'Awareness',
      icon: <Eye size={24} />,
      position: 'bottom-1/3 right-1/2 translate-x-1/2',
      description: 'Expand your perception of reality',
      color: 'from-astral-300 to-astral-600',
      unlocked: false
    },
    {
      id: 'breathwork',
      name: 'Breathwork',
      icon: <Cloud size={24} />,
      position: 'bottom-1/2 left-1/3 translate-y-[50%]',
      description: 'Master your breath to control energy',
      color: 'from-quantum-400 to-quantum-600',
      unlocked: false
    },
    {
      id: 'guidance',
      name: 'Inner Guidance',
      icon: <Compass size={24} />,
      position: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      description: 'Connect with your higher wisdom',
      color: 'from-quantum-300 to-astral-500',
      unlocked: true
    },
  ];

  const handleCategoryClick = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category?.unlocked) {
      setActiveCategory(id);
      if (onCategorySelect) {
        onCategorySelect(id);
      }
    }
  };

  const shouldConnectCategories = (cat1Id: string, cat2Id: string) => {
    const connections: Record<string, string[]> = {
      'meditation': ['chakras', 'guidance', 'energy', 'intention'],
      'energy': ['chakras', 'healing', 'connection', 'guidance'],
      'chakras': ['meditation', 'energy', 'intention', 'guidance'],
      'guidance': ['meditation', 'chakras', 'quantum', 'energy', 'intention', 'connection'],
      'intention': ['meditation', 'chakras', 'manifestation', 'dreams'],
      'connection': ['energy', 'guidance', 'astral', 'healing'],
      'healing': ['energy', 'connection', 'awareness'],
      'astral': ['connection', 'awareness', 'dreams'],
      'awareness': ['astral', 'dreams', 'healing', 'breathwork'],
      'dreams': ['astral', 'awareness', 'manifestation', 'intention'],
      'manifestation': ['dreams', 'intention', 'breathwork'],
      'breathwork': ['awareness', 'manifestation', 'quantum'],
      'quantum': ['guidance', 'breathwork']
    };
    
    return connections[cat1Id]?.includes(cat2Id) || false;
  };

  const getConnectionClasses = (cat1Id: string, cat2Id: string) => {
    const isActive = activeCategory === cat1Id || activeCategory === cat2Id;
    const isHovered = hoverCategory === cat1Id || hoverCategory === cat2Id;
    
    return cn(
      "absolute bg-gradient-to-r from-white/10 to-white/20 h-px",
      isActive ? "opacity-100" : "opacity-30",
      isHovered ? "opacity-70" : ""
    );
  };

  return (
    <div className={cn("seed-of-life relative aspect-square", className)}>
      <motion.div 
        className="absolute w-full h-full rounded-full border border-white/20"
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      <div className="absolute w-full h-full opacity-10">
        <div className="w-full h-full rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 left-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 right-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 left-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 right-1/6 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 top-1/6 left-1/2 -translate-x-1/2 rounded-full border border-white/30"></div>
        <div className="absolute w-2/3 h-2/3 bottom-1/6 left-1/2 -translate-x-1/2 rounded-full border border-white/30"></div>
      </div>
      
      <div className="absolute inset-0">
        {categories.map((cat1) => (
          categories.map((cat2) => {
            if (shouldConnectCategories(cat1.id, cat2.id) && cat1.id < cat2.id) {
              const startPos = cat1.position.includes('left') ? 'left' : cat1.position.includes('right') ? 'right' : 'center';
              const startVertical = cat1.position.includes('top') ? 'top' : cat1.position.includes('bottom') ? 'bottom' : 'middle';
              
              const endPos = cat2.position.includes('left') ? 'left' : cat2.position.includes('right') ? 'right' : 'center';
              const endVertical = cat2.position.includes('top') ? 'top' : cat2.position.includes('bottom') ? 'bottom' : 'middle';
              
              return (
                <motion.div 
                  key={`${cat1.id}-${cat2.id}`}
                  className={getConnectionClasses(cat1.id, cat2.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '40%',
                    transform: `rotate(${Math.atan2(
                      (endVertical === 'top' ? 0 : endVertical === 'bottom' ? 100 : 50) - 
                      (startVertical === 'top' ? 0 : startVertical === 'bottom' ? 100 : 50),
                      (endPos === 'left' ? 0 : endPos === 'right' ? 100 : 50) - 
                      (startPos === 'left' ? 0 : startPos === 'right' ? 100 : 50)
                    ) * (180 / Math.PI)}deg)`
                  }}
                />
              );
            }
            return null;
          })
        ))}
      </div>
      
      {categories.map((category) => (
        <motion.div 
          key={category.id}
          className={cn(
            "seed-of-life-circle absolute",
            category.position,
            activeCategory === category.id ? "z-10" : "z-0"
          )}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ 
            opacity: category.unlocked ? 1 : 0.5,
            scale: activeCategory === category.id ? 1.1 : 1
          }}
          transition={{ 
            duration: 0.5, 
            delay: categories.indexOf(category) * 0.1
          }}
          onMouseEnter={() => setHoverCategory(category.id)}
          onMouseLeave={() => setHoverCategory(null)}
        >
          <CategoryIcon 
            id={category.id}
            name={category.name}
            icon={category.icon}
            description={category.description}
            gradientColor={category.color}
            isActive={activeCategory === category.id}
            isLocked={!category.unlocked}
            onClick={() => handleCategoryClick(category.id)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default SeedOfLife;
