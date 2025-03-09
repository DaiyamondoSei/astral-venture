
export interface ColorScheme {
  background: string;
  particlePrimary: string;
  particleSecondary: string;
  glowColor: string;
}

export const getColorScheme = (scheme: 'default' | 'ethereal' | 'astral' | 'quantum'): ColorScheme => {
  switch (scheme) {
    case 'ethereal':
      return {
        background: 'from-[#030014] via-[#0F0527] to-[#10031c]',
        particlePrimary: '#8B5CF6',
        particleSecondary: '#6D28D9',
        glowColor: 'rgba(139, 92, 246, 0.5)'
      };
    case 'astral':
      return {
        background: 'from-[#040720] via-[#0F1A40] to-[#0A0F33]',
        particlePrimary: '#3B82F6',
        particleSecondary: '#1D4ED8',
        glowColor: 'rgba(59, 130, 246, 0.5)'
      };
    case 'quantum':
      return {
        background: 'from-[#0C0A20] via-[#231748] to-[#190A38]',
        particlePrimary: '#EC4899',
        particleSecondary: '#BE185D',
        glowColor: 'rgba(236, 72, 153, 0.5)'
      };
    default:
      return {
        background: 'from-[#221F26] via-[#2C2B33] to-[#191A23]',
        particlePrimary: '#A78BFA',
        particleSecondary: '#7C3AED',
        glowColor: 'rgba(167, 139, 250, 0.5)'
      };
  }
};
