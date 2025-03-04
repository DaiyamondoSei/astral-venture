
import React from 'react';
import { ChakraActivation } from './ChakraPoints';

interface ChakraConnectionsProps {
  chakras: ChakraActivation;
}

const ChakraConnections: React.FC<ChakraConnectionsProps> = ({ chakras }) => {
  return (
    <>
      {/* Add connecting lines between activated chakras for a more integrated look */}
      {(chakras.root && chakras.sacral) && (
        <line x1="100" y1="280" x2="100" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
      {(chakras.sacral && chakras.solar) && (
        <line x1="100" y1="220" x2="100" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
      {(chakras.solar && chakras.heart) && (
        <line x1="100" y1="180" x2="100" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
      {(chakras.heart && chakras.throat) && (
        <line x1="100" y1="140" x2="100" y2="110" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
      {(chakras.throat && chakras.third) && (
        <line x1="100" y1="110" x2="100" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
      {(chakras.third && chakras.crown) && (
        <line x1="100" y1="90" x2="100" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      )}
    </>
  );
};

export default ChakraConnections;
