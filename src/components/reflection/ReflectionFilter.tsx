
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReflectionFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  total?: number;
  energyCount?: number;
  philosophicalCount?: number;
}

const ReflectionFilter: React.FC<ReflectionFilterProps> = ({
  activeFilter,
  onFilterChange,
  total = 0,
  energyCount = 0,
  philosophicalCount = 0
}) => {
  return (
    <div className="flex space-x-2">
      <Badge 
        variant={activeFilter === 'all' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('all')}
      >
        All {total > 0 && `(${total})`}
      </Badge>
      <Badge 
        variant={activeFilter === 'high-energy' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('high-energy')}
      >
        Energy {energyCount > 0 && `(${energyCount})`}
      </Badge>
      <Badge 
        variant={activeFilter === 'heart' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('heart')}
      >
        Heart
      </Badge>
      <Badge 
        variant={activeFilter === 'third-eye' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('third-eye')}
      >
        Third Eye
      </Badge>
    </div>
  );
};

export default ReflectionFilter;
