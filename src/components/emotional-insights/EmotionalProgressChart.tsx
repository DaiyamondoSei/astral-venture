
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EmotionalProgressChartProps {
  historyData: {
    timeline: Array<{
      date: string;
      emotionalGrowth: number;
      dominantEmotion: string;
    }>;
    milestones: Array<{
      date: string;
      title: string;
      description: string;
    }>;
  };
}

const EmotionalProgressChart: React.FC<EmotionalProgressChartProps> = ({ historyData }) => {
  if (!historyData.timeline || historyData.timeline.length < 2) {
    return (
      <div className="px-4 py-3 bg-black/20 rounded-lg text-white/60 text-xs">
        Continue reflecting to see your emotional growth chart
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="mb-2">
        <span className="text-white/80 text-sm">Emotional Growth Progression</span>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={historyData.timeline}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
              tickFormatter={(value) => value.split(' ')[0]}
            />
            <YAxis 
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(155, 135, 245, 0.5)',
                borderRadius: '4px',
                color: 'white'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="emotionalGrowth" 
              name="Emotional Growth"
              stroke="#9b87f5" 
              activeDot={{ r: 6 }} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionalProgressChart;
