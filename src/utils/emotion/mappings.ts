
/**
 * Mappings between emotions, chakras, and insights
 */

// Enhanced mapping of theme names to chakra indices with more connections
export const themeToChakraMap: {[key: string]: number[]} = {
  love: [3], // Heart (index adjusted to match visualization)
  peace: [2, 6], // Throat, Crown
  power: [4, 0], // Solar plexus, Root
  wisdom: [5, 6], // Third eye, Crown
  creativity: [1, 2], // Sacral, Throat
  spirituality: [6, 5], // Crown, Third eye
  healing: [3, 0], // Heart, Root
  gratitude: [3, 4], // Heart, Solar plexus
  joy: [3, 1], // Heart, Sacral
  growth: [0, 1, 4], // Root, Sacral, Solar plexus
};

// Enhanced map of theme names to emotion names with richer descriptions
export const themeToEmotionMap: {[key: string]: string} = {
  love: 'Love & Compassion',
  peace: 'Peace & Tranquility',
  power: 'Confidence & Strength',
  wisdom: 'Wisdom & Insight',
  creativity: 'Creativity & Expression',
  spirituality: 'Spiritual Connection',
  healing: 'Healing & Transformation',
  gratitude: 'Gratitude & Appreciation',
  joy: 'Joy & Bliss',
  growth: 'Growth & Evolution',
};

// Enhanced map of theme names to insight messages with more depth
export const themeToInsightMap: {[key: string]: string} = {
  love: 'Your heart energy radiates strongly, creating a field of compassion around you.',
  peace: 'You naturally attune to higher states of harmony, even amid external chaos.',
  power: 'Your inner power is awakening as you practice, bringing confidence to your energy work.',
  wisdom: 'Your intuitive abilities are expanding rapidly, revealing deeper truths about reality.',
  creativity: 'Your creative energy seeks greater channels of expression in your spiritual practice.',
  spirituality: 'Your consciousness is expanding into higher dimensions, transcending ordinary awareness.',
  healing: 'You are in an important healing cycle right now that affects multiple aspects of your being.',
  gratitude: 'Your practice of gratitude is transforming your energy field in profound ways.',
  joy: 'You are accessing states of natural bliss that reveal the inherent joy in existence.',
  growth: 'You are in an accelerated growth phase, rapidly evolving in multiple dimensions.',
};

// Enhanced keywords for emotional analysis with expanded vocabulary
export const emotionalKeywords = {
  love: ['love', 'compassion', 'heart', 'connect', 'relationship', 'caring', 'tenderness', 'affection', 'warmth', 'kindness'],
  joy: ['joy', 'happy', 'delight', 'bliss', 'pleasure', 'ecstatic', 'elated', 'jubilant', 'thrilled', 'content'],
  peace: ['peace', 'calm', 'tranquil', 'harmony', 'balance', 'serene', 'centered', 'still', 'quiet', 'relaxed'],
  power: ['power', 'strength', 'confidence', 'achieve', 'success', 'capable', 'empowered', 'determined', 'decisive', 'willpower'],
  wisdom: ['wisdom', 'insight', 'knowledge', 'understand', 'awareness', 'clarity', 'discernment', 'comprehension', 'realization', 'perspective'],
  creativity: ['create', 'imagine', 'express', 'inspire', 'art', 'innovative', 'original', 'imaginative', 'vision', 'inventive'],
  gratitude: ['grateful', 'thankful', 'appreciate', 'blessing', 'gift', 'appreciative', 'recognition', 'acknowledge', 'honored', 'valued'],
  healing: ['heal', 'release', 'recover', 'restore', 'mend', 'renewal', 'regenerate', 'therapeutic', 'cathartic', 'purify'],
  spiritual: ['spirit', 'soul', 'divine', 'sacred', 'transcend', 'higher self', 'consciousness', 'awakening', 'enlightenment', 'connection'],
  fear: ['fear', 'worry', 'anxiety', 'stress', 'concern', 'apprehension', 'dread', 'panic', 'nervous', 'frightened'],
  anger: ['anger', 'frustration', 'irritation', 'rage', 'upset', 'annoyed', 'resentment', 'outrage', 'indignation', 'fury'],
  sadness: ['sad', 'grief', 'depression', 'melancholy', 'down', 'sorrow', 'despair', 'misery', 'gloom', 'heartache']
};

// Enhanced analysis insights based on emotions with more personalized guidance
export const emotionToInsightMap: {[key: string]: string} = {
  love: 'Your heart-centered approach is strengthening your connections and expanding your capacity for unconditional love.',
  joy: 'Joy is becoming a more consistent state in your practice, helping you access higher vibrational frequencies.',
  peace: 'Your ability to remain centered is growing stronger, creating a peaceful foundation for spiritual growth.',
  power: 'You\'re learning to harness your personal power effectively while maintaining balance with compassion.',
  wisdom: 'Your capacity for deeper insights is expanding, revealing patterns and connections previously hidden.',
  creativity: 'Creative energy is flowing more freely in your practice, opening new pathways for self-expression.',
  gratitude: 'Your practice of gratitude is transforming your perception and attracting more positive experiences.',
  healing: 'You are in a powerful healing cycle that is addressing both recent and deeper historical patterns.',
  spiritual: 'Your spiritual awareness is deepening, creating profound shifts in how you perceive reality.',
  fear: 'Working through fear is part of your growth journey now, transmuting it into courage and wisdom.',
  anger: 'Transforming anger into constructive energy is a current lesson, revealing where boundaries need attention.',
  sadness: 'Processing emotions fully is creating space for new energy and deeper joy to emerge in your practice.',
};

// Enhanced chakra mapping for emotions with more precise associations
export const emotionToChakraMap: {[key: string]: number[]} = {
  love: [3], // Heart
  joy: [3, 1], // Heart, Sacral
  peace: [2, 6], // Throat, Crown
  power: [4, 0], // Solar plexus, Root
  wisdom: [5, 6], // Third eye, Crown
  creativity: [1, 2], // Sacral, Throat
  gratitude: [3, 4], // Heart, Solar plexus
  healing: [3, 0, 1], // Heart, Root, Sacral
  spiritual: [6, 5], // Crown, Third eye
  fear: [0], // Root
  anger: [4], // Solar plexus
  sadness: [3], // Heart
};

// New: Chakra names for visualization and user interface
export const chakraNames = [
  "Root", // 0
  "Sacral", // 1
  "Throat", // 2
  "Heart", // 3
  "Solar Plexus", // 4
  "Third Eye", // 5
  "Crown" // 6
];

// New: Chakra colors for visualization (hex)
export const chakraColors = [
  "#FF0000", // Root - Red
  "#FF8000", // Sacral - Orange
  "#00FFFF", // Throat - Light Blue
  "#00FF00", // Heart - Green
  "#FFFF00", // Solar Plexus - Yellow
  "#0000FF", // Third Eye - Indigo
  "#8000FF"  // Crown - Violet
];

// New: Chakra properties with detailed information
export const chakraProperties = [
  {
    name: "Root",
    element: "Earth",
    function: "Grounding, stability, security",
    balanceIndicators: ["feeling safe", "financially secure", "physically strong"],
    imbalanceIndicators: ["anxiety", "fear", "insecurity", "financial stress"]
  },
  {
    name: "Sacral",
    element: "Water",
    function: "Creativity, emotion, sensuality",
    balanceIndicators: ["creative flow", "emotional balance", "healthy relationships"],
    imbalanceIndicators: ["emotional volatility", "creative blocks", "relationship issues"]
  },
  {
    name: "Throat",
    element: "Ether",
    function: "Communication, expression, truth",
    balanceIndicators: ["clear communication", "authentic expression", "speaking truth"],
    imbalanceIndicators: ["inability to express", "fear of speaking", "communication blocks"]
  },
  {
    name: "Heart",
    element: "Air",
    function: "Love, compassion, connection",
    balanceIndicators: ["unconditional love", "forgiveness", "compassion", "connection"],
    imbalanceIndicators: ["grief", "isolation", "bitterness", "disconnection"]
  },
  {
    name: "Solar Plexus",
    element: "Fire",
    function: "Personal power, confidence, will",
    balanceIndicators: ["confidence", "motivation", "strong boundaries", "decisiveness"],
    imbalanceIndicators: ["low self-esteem", "indecision", "weak boundaries", "control issues"]
  },
  {
    name: "Third Eye",
    element: "Light",
    function: "Intuition, insight, imagination",
    balanceIndicators: ["intuitive clarity", "strong visualization", "mental clarity"],
    imbalanceIndicators: ["confusion", "lack of direction", "poor memory", "overthinking"]
  },
  {
    name: "Crown",
    element: "Consciousness",
    function: "Spiritual connection, awareness, transcendence",
    balanceIndicators: ["spiritual connection", "higher awareness", "transcendent experiences"],
    imbalanceIndicators: ["spiritual disconnection", "materialism", "nihilism", "cynicism"]
  }
];
