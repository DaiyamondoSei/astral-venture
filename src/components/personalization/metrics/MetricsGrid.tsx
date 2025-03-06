
import React from 'react';
import { PersonalizationMetrics } from '@/services/personalization';
import MetricItem, { getIconByMetricType } from './MetricItem';

interface MetricsGridProps {
  metrics: PersonalizationMetrics;
  compact?: boolean;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, compact = false }) => {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <MetricItem 
          icon={getIconByMetricType('Engagement')}
          label="Engagement"
          value={metrics.engagementScore}
          showPercentSign
          compact
        />
        <MetricItem 
          icon={getIconByMetricType('Content Relevance')}
          label="Content Relevance"
          value={metrics.contentRelevanceRating}
          showPercentSign
          compact
        />
        <MetricItem 
          icon={getIconByMetricType('Growth Rate')}
          label="Growth Rate"
          value={metrics.emotionalGrowthRate}
          showPercentSign
          compact
        />
        <MetricItem 
          icon={getIconByMetricType('Chakra Balance')}
          label="Chakra Balance"
          value={metrics.chakraBalanceImprovement}
          prefix={metrics.chakraBalanceImprovement > 0 ? '+' : ''}
          compact
        />
      </div>
    );
  }

  return (
    <>
      <MetricItem 
        icon={getIconByMetricType('Engagement Score')}
        label="Engagement Score"
        value={metrics.engagementScore}
        description="How actively you're using personalized features"
        showPercentSign
      />
      <MetricItem 
        icon={getIconByMetricType('Content Relevance')}
        label="Content Relevance"
        value={metrics.contentRelevanceRating}
        description="How well recommendations match your interests"
        showPercentSign
      />
      <MetricItem 
        icon={getIconByMetricType('Chakra Balance Improvement')}
        label="Chakra Balance Improvement"
        value={metrics.chakraBalanceImprovement}
        description="How your energy balance has changed over time"
        prefix={metrics.chakraBalanceImprovement > 0 ? '+' : ''}
      />
      <MetricItem 
        icon={getIconByMetricType('Emotional Growth Rate')}
        label="Emotional Growth Rate"
        value={metrics.emotionalGrowthRate}
        description="Improvement in emotional awareness through reflections"
        showPercentSign
      />
      <MetricItem 
        icon={getIconByMetricType('Progress Acceleration', metrics.progressAcceleration)}
        label="Progress Acceleration"
        value={metrics.progressAcceleration}
        description="How your progress rate has changed over time"
        prefix={metrics.progressAcceleration > 0 ? '+' : ''}
      />
    </>
  );
};

export default MetricsGrid;
