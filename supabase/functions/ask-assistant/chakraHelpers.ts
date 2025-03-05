
// Helper functions related to chakras
export function getChakraName(index: number): string {
  const chakraNames = [
    "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"
  ];
  return chakraNames[index] || "Unknown";
}
