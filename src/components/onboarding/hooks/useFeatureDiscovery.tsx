
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { featureTooltips } from '../data';
import type { FeatureTooltipData } from './achievement/types';

/**
 * Hook for handling feature discovery tooltips
 * Optimized for performance with local storage caching
 */
export const useFeatureDiscovery = () => {
  const { user } = useAuth();
  const [visibleTooltips, setVisibleTooltips] = useState<FeatureTooltipData[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<FeatureTooltipData | null>(null);
  const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);

  // Load discovered features from localStorage on mount
  useEffect(() => {
    if (!user) return;
    
    try {
      const stored = localStorage.getItem(`discovered_features_${user.id}`);
      if (stored) {
        setDiscoveredFeatures(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading discovered features:', error);
    }
  }, [user]);

  // Determine which tooltips should be shown based on conditions
  useEffect(() => {
    if (!user) return;
    
    // Skip processing if no tooltips available
    if (!featureTooltips || featureTooltips.length === 0) {
      console.warn('No feature tooltips available');
      return;
    }
    
    // Filter tooltips based on discovery conditions and already seen
    const eligible = featureTooltips.filter(tooltip => {
      // Skip already discovered features
      if (discoveredFeatures.includes(tooltip.id)) return false;
      
      // Evaluate condition (simplified for now)
      const condition = tooltip.condition;
      // You can add your condition evaluation logic here
      // For now, we'll just show all undiscovered tooltips
      return true;
    });
    
    setVisibleTooltips(eligible);
  }, [user, discoveredFeatures]);

  // Mark a feature as discovered
  const markDiscovered = (tooltipId: string) => {
    if (!user) return;
    
    const updated = [...discoveredFeatures, tooltipId];
    setDiscoveredFeatures(updated);
    
    // Remove from visible tooltips
    setVisibleTooltips(prev => prev.filter(t => t.id !== tooltipId));
    
    // Clear active tooltip if it was the one discovered
    if (activeTooltip?.id === tooltipId) {
      setActiveTooltip(null);
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(`discovered_features_${user.id}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving discovered features:', error);
    }
  };

  // Show a specific tooltip
  const showTooltip = (tooltipId: string) => {
    const tooltip = visibleTooltips.find(t => t.id === tooltipId);
    if (tooltip) {
      setActiveTooltip(tooltip);
    }
  };

  // Hide the active tooltip
  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return {
    visibleTooltips,
    activeTooltip,
    discoveredFeatures,
    markDiscovered,
    showTooltip,
    hideTooltip,
  };
};

export default useFeatureDiscovery;
