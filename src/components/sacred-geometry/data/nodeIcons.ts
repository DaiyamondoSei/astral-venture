
import React from 'react';
import { 
  Compass, Star, Flower, Sun, Moon, Sparkles, 
  Brain, Heart, Eye, Zap, Flame, Triangle, CircleDot,
  Book, Waves, Music, UserCircle, Map
} from 'lucide-react';

// Define icons for node categories
export const nodeIcons: Record<string, React.ReactNode> = {
  meditation: React.createElement(Brain, { size: 24 }),
  chakras: React.createElement(Sun, { size: 24 }),
  dreams: React.createElement(Moon, { size: 24 }),
  energy: React.createElement(Zap, { size: 24 }),
  reflection: React.createElement(Eye, { size: 24 }),
  healing: React.createElement(Heart, { size: 24 }),
  wisdom: React.createElement(Star, { size: 24 }),
  astral: React.createElement(Sparkles, { size: 24 }),
  sacred: React.createElement(Triangle, { size: 24 }),
  elements: React.createElement(Flame, { size: 24 }),
  consciousness: React.createElement(CircleDot, { size: 24 }),
  nature: React.createElement(Flower, { size: 24 }),
  guidance: React.createElement(Compass, { size: 24 }),
  sound: React.createElement(Music, { size: 24 }),
  user: React.createElement(UserCircle, { size: 24 }),
};

export default nodeIcons;
