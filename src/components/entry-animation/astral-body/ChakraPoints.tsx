
import React from 'react';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

export interface ChakraActivation {
  root: boolean;
  sacral: boolean;
  solar: boolean;
  heart: boolean;
  throat: boolean;
  third: boolean;
  crown: boolean;
}

interface ChakraPointsProps {
  chakras: ChakraActivation;
}

const ChakraPoints: React.FC<ChakraPointsProps> = ({ chakras }) => {
  return (
    <>
      {/* Energy Points (chakras) with emotional activation */}
      <circle cx="100" cy="280" r="6" className={`energy-point root-chakra ${chakras.root ? 'active' : 'inactive'}`} style={{opacity: chakras.root ? 1 : 0.3}} />
      <circle cx="100" cy="220" r="5" className={`energy-point sacral-chakra ${chakras.sacral ? 'active' : 'inactive'}`} style={{opacity: chakras.sacral ? 1 : 0.3}} />
      <circle cx="100" cy="180" r="6" className={`energy-point solar-chakra ${chakras.solar ? 'active' : 'inactive'}`} style={{opacity: chakras.solar ? 1 : 0.3}} />
      <circle cx="100" cy="140" r="7" className={`energy-point heart-chakra ${chakras.heart ? 'active' : 'inactive'}`} style={{opacity: chakras.heart ? 1 : 0.3}} />
      <circle cx="100" cy="110" r="5" className={`energy-point throat-chakra ${chakras.throat ? 'active' : 'inactive'}`} style={{opacity: chakras.throat ? 1 : 0.3}} />
      <circle cx="100" cy="90" r="4" className={`energy-point third-chakra ${chakras.third ? 'active' : 'inactive'}`} style={{opacity: chakras.third ? 1 : 0.3}} />
      <circle cx="100" cy="60" r="6" className={`energy-point crown-chakra ${chakras.crown ? 'active' : 'inactive'}`} style={{opacity: chakras.crown ? 1 : 0.3}} />
    </>
  );
};

export default ChakraPoints;
