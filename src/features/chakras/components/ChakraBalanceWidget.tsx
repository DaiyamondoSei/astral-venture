
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Crown, Heart, Star } from 'lucide-react';

interface ChakraBalanceWidgetProps {
  onClick?: () => void;
}

const ChakraBalanceWidget: React.FC<ChakraBalanceWidgetProps> = ({ onClick }) => {
  // In a real implementation, this would come from a hook or context
  const chakraBalances = {
    crown: 75,
    thirdEye: 60,
    throat: 45,
    heart: 80,
    solar: 55,
    sacral: 70,
    root: 65
  };
  
  const getChakraIcon = (chakra: string) => {
    switch (chakra) {
      case 'crown':
        return <Crown className="text-purple-400" size={18} />;
      case 'heart':
        return <Heart className="text-green-400" size={18} />;
      default:
        return <Star className="text-blue-400" size={18} />;
    }
  };
  
  const getChakraColor = (chakra: string) => {
    switch (chakra) {
      case 'crown': return 'bg-purple-600';
      case 'thirdEye': return 'bg-indigo-600';
      case 'throat': return 'bg-blue-600';
      case 'heart': return 'bg-green-600';
      case 'solar': return 'bg-yellow-600';
      case 'sacral': return 'bg-orange-600';
      case 'root': return 'bg-red-600';
      default: return 'bg-violet-600';
    }
  };
  
  return (
    <Card 
      className="border-quantum-700 bg-quantum-800/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-quantum-900">
            <Crown className="h-4 w-4 text-purple-400" />
          </div>
          Chakra Balance
        </CardTitle>
        <CardDescription>Current energy distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(chakraBalances).map(([chakra, value]) => (
            <div key={chakra} className="space-y-1">
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  {getChakraIcon(chakra)}
                  <span className="capitalize">{chakra}</span>
                </div>
                <span>{value}%</span>
              </div>
              <Progress value={value} className={`h-1 ${getChakraColor(chakra)}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChakraBalanceWidget;
