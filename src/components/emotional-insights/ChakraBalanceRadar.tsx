
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { chakraColors, chakraNames } from '@/utils/emotion/mappings';

interface ChakraBalanceRadarProps {
  chakraData: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
}

const ChakraBalanceRadar: React.FC<ChakraBalanceRadarProps> = ({ chakraData }) => {
  return (
    <div className="px-4 py-3 bg-black/20 rounded-lg">
      <div className="mb-2">
        <span className="text-white/80 text-sm">Chakra Energy Balance</span>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chakraData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} 
            />
            <Radar
              name="Chakra Balance"
              dataKey="value"
              stroke="rgba(155, 135, 245, 0.8)"
              fill="rgba(155, 135, 245, 0.3)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChakraBalanceRadar;
