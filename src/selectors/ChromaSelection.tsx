import React from 'react';

import { Chroma } from '../skin_chromas/list';

interface Props {
  champ: string;
  chromas: Chroma[];
  prevChroma: string;
  onChromaSelection: (champ: string, chromaName: string) => void;
}

export const ChromaSelection = (props: Props) => {
  const { champ, chromas, prevChroma, onChromaSelection } = props;

  return (
    <div className={`selector-wrapper`}>
      {
        chromas.map(chroma => (
          <div
            key={chroma.name}
            className={`selector--selection ${prevChroma && prevChroma === chroma.name ? 'selection--selected' : ''}`}
            onClick={() => onChromaSelection(champ, chroma.name)}
          >
            <img src={chroma.imageUrl} alt={chroma.name} title={chroma.name}/> {chroma.name}
          </div>
        ))
      }
    </div>
  )
};