import React from 'react';

import { Chroma } from './skin_chromas/list';

interface Props {
  chroma: Chroma;
}

export const RandomChromaSuggestion = (props: Props) => {
  const { chroma } = props;

  return (
    <div className={`selector-wrapper`}>
      <div
        className={`selector--selection-random`}
      >
        <img src={chroma.imageUrl} alt={chroma.name} title={chroma.name}/> {chroma.name}
      </div>
    </div>
  )
}