
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon } from 'lucide-react';

interface TabItemProps {
  value: string;
  icon: LucideIcon;
  label: string;
}

const TabItem: React.FC<TabItemProps> = ({ value, icon: Icon, label }) => {
  return (
    <TabsTrigger value={value} className="flex items-center">
      <Icon size={16} className="mr-2" />
      {label}
    </TabsTrigger>
  );
};

export default TabItem;
