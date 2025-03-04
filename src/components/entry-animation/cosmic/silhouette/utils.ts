
import { generateEnergyColor } from '../colorUtils';

export const getFilterForLevel = (
  showInfinity: boolean, 
  showTranscendence: boolean
): string | undefined => {
  if (showInfinity) {
    return "url(#cosmicRays)";
  } else if (showTranscendence) {
    return "url(#etherealGlow)";
  }
  return undefined;
};

export const getStrokeClassForLevel = (
  showInfinity: boolean,
  showTranscendence: boolean,
  showIllumination: boolean
): string => {
  if (showInfinity) {
    return 'stroke-violet-300/40 stroke-[0.4]';
  } else if (showTranscendence) {
    return 'stroke-indigo-300/35 stroke-[0.35]';
  } else if (showIllumination) {
    return 'stroke-cyan-300/30 stroke-[0.3]';
  }
  return '';
};

export const getFillForSilhouette = (showFractal: boolean): string => {
  return showFractal ? "url(#fractalPattern)" : "url(#silhouetteGradient)";
};

export const getChakraColor = (
  showIllumination: boolean,
  showInfinity: boolean,
  showTranscendence: boolean,
  showFractal: boolean
): string => {
  return showIllumination 
    ? "url(#chakraGradient)" 
    : generateEnergyColor("#38BDF8", 1, showInfinity, showTranscendence, showFractal, showIllumination);
};
