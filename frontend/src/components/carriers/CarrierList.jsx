import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CarrierCard from './CarrierCard';

const listVariants = {
  visible: {
    transition: { staggerChildren: 0.05 }
  }
};

export default function CarrierList({ carriers, selectedId, onSelect, isComputing = false, mode = 'normal' }) {
  return (
    <div className="relative">
      {isComputing && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ice/20 to-transparent animate-pulse z-10" />
      )}
      <AnimatePresence>
        {carriers.map(c => (
          <CarrierCard
            key={c.id}
            carrier={c}
            selected={selectedId === c.id}
            onClick={() => onSelect(c.id)}
            mode={mode}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}