
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { EnergyReflection } from '@/services/reflection/types';
import { format } from 'date-fns';

interface ReflectionHistoryChartProps {
  reflections: EnergyReflection[];
}

const ReflectionHistoryChart: React.FC<ReflectionHistoryChartProps> = ({ reflections }) => {
  // Prepare data for the chart
  const chartData = reflections
    .slice(0, 10) // Take most recent 10
    .map(reflection => {
      // Format date to be more readable
      const date = new Date(reflection.created_at);
      return {
        date: format(date, 'MMM d'),
        points: reflection.points_earned,
        depth: reflection.emotional_depth ? Math.round(reflection.emotional_depth * 100) : 0,
        emotion: reflection.dominant_emotion || 'Unknown',
        id: reflection.id,
        formattedDate: format(date, 'MMMM d, yyyy')
      };
    })
    .reverse(); // Display oldest to newest

  // Custom tooltip to show more details
  const CustomTooltip = ({
    active,
    payload,
    label
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 p-2 rounded border border-white/20 text-xs">
          <p className="text-white/90 font-medium">{data.formattedDate}</p>
          <p className="text-quantum-400">{data.points} points earned</p>
          {data.depth > 0 && (
            <p className="text-white/70">Emotional Depth: {data.depth}%</p>
          )}
          {data.emotion && (
            <p className="text-white/70">Dominant: {data.emotion}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (reflections.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-black/20 rounded-lg">
        <p className="text-white/50 text-sm">No reflection data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 p-4 rounded-lg">
      <h3 className="text-white/90 text-sm font-medium mb-4">Reflection History</h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#ffffff80', fontSize: 10 }}
              axisLine={{ stroke: '#ffffff20' }}
              tickLine={{ stroke: '#ffffff20' }}
            />
            <YAxis 
              tick={{ fill: '#ffffff80', fontSize: 10 }}
              axisLine={{ stroke: '#ffffff20' }}
              tickLine={{ stroke: '#ffffff20' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="points" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-white/50 text-xs">
          Your reflection journey shows your emotional growth over time
        </p>
      </div>
    </div>
  );
};

export default ReflectionHistoryChart;
