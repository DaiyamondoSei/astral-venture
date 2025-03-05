// Update the import to use the correct type and function
import { ChakraActivated, normalizeChakraData, isChakraActivated } from '@/utils/emotion/chakraTypes';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReflectionHistoryInsights from '@/components/reflection/ReflectionHistoryInsights';

interface Reflection {
  id: string;
  content: string;
  created_at: string;
  dominant_emotion: string;
  chakras_activated: ChakraActivated;
  emotional_depth: number;
}

interface ReflectionHistoryProps {
  reflections: Reflection[];
}

interface ReflectionItemProps {
  reflection: Reflection;
  onViewInsights: (reflection: Reflection) => void;
}

const ReflectionItem: React.FC<ReflectionItemProps> = ({ reflection, onViewInsights }) => {
  return (
    <div className="glass-card p-4">
      <p className="text-sm text-gray-500">{reflection.created_at}</p>
      <p className="text-md">{reflection.content.substring(0, 100)}...</p>
      <Button variant="secondary" size="sm" onClick={() => onViewInsights(reflection)}>
        View Insights
      </Button>
    </div>
  );
};

// Fix the type in the component to ensure reflection.id is a string
const ReflectionHistory = ({ reflections }: ReflectionHistoryProps) => {
  const [filter, setFilter] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const filteredReflections = reflections.filter(reflection => {
    const searchTerm = filter.toLowerCase();
    const contentMatch = reflection.content.toLowerCase().includes(searchTerm);
    const emotionMatch = reflection.dominant_emotion.toLowerCase().includes(searchTerm);
    
    let dateMatch = true;
    if (date) {
      const reflectionDate = new Date(reflection.created_at);
      dateMatch = (
        reflectionDate.getFullYear() === date.getFullYear() &&
        reflectionDate.getMonth() === date.getMonth() &&
        reflectionDate.getDate() === date.getDate()
      );
    }
    
    return (contentMatch || emotionMatch) && dateMatch;
  });

  const handleViewInsights = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setShowInsights(true);
  };

  const handleCloseInsights = () => {
    setShowInsights(false);
    setSelectedReflection(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Filter reflections..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) =>
                date > new Date() || date < new Date("2023-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-3">
        {filteredReflections.map((reflection) => (
          <ReflectionItem 
            key={String(reflection.id)} // Ensure ID is converted to string
            reflection={{
              id: String(reflection.id), // Convert ID to string to fix type issues
              content: reflection.content,
              created_at: reflection.created_at,
              dominant_emotion: reflection.dominant_emotion,
              chakras_activated: reflection.chakras_activated,
              emotional_depth: reflection.emotional_depth
            }}
            onViewInsights={() => handleViewInsights(reflection)}
          />
        ))}
      </div>
      
      {showInsights && selectedReflection && (
        <ReflectionHistoryInsights 
          reflection={selectedReflection}
          onClose={handleCloseInsights}
        />
      )}
    </div>
  );
};

export default ReflectionHistory;
