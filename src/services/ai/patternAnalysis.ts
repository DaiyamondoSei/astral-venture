import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

export const analyzeEmotionPatterns = (reflections) => {
  const emotionCounts = {};

  reflections.forEach((reflection) => {
    const emotion = reflection.dominant_emotion;
    if (emotion) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    }
  });

  const totalReflections = reflections.length;
  const emotionFrequencies = {};

  for (const emotion in emotionCounts) {
    emotionFrequencies[emotion] = (emotionCounts[emotion] / totalReflections) * 100;
  }

  const sortedEmotions = Object.entries(emotionFrequencies)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  return sortedEmotions;
};

export const analyzeChakraPatterns = (reflections) => {
  const chakraCounts = {};

  reflections.forEach((reflection) => {
    const chakras = normalizeChakraData(reflection.chakras_activated);
    chakras.forEach((chakra) => {
      const chakraIndex = Number(chakra);
      if (!isNaN(chakraIndex)) {
        if (!chakraCounts[chakraIndex]) {
          chakraCounts[chakraIndex] = 0;
        }
        chakraCounts[chakraIndex] += 1;
      }
    });
  });

  const totalReflections = reflections.length;
  const chakraFrequencies = {};

  for (const chakra in chakraCounts) {
    chakraFrequencies[chakra] = (chakraCounts[chakra] / totalReflections) * 100;
  }

   const sortedChakras = Object.entries(chakraFrequencies)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  return sortedChakras;
};

export const analyzeEmotionalDepth = (reflections) => {
  const totalDepth = reflections.reduce((sum, reflection) => sum + reflection.emotional_depth, 0);
  const averageDepth = reflections.length > 0 ? totalDepth / reflections.length : 0;
  return averageDepth;
};

export const detectReflectionPatterns = (reflections) => {
  const emotionPatterns = analyzeEmotionPatterns(reflections);
  const chakraPatterns = analyzeChakraPatterns(reflections);
  const averageEmotionalDepth = analyzeEmotionalDepth(reflections);

  const patterns = {
    emotionPatterns,
    chakraPatterns,
    averageEmotionalDepth,
  };

  return patterns;
};
