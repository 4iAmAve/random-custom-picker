import React from 'react';

import { SkinBasedChromas } from '../skin_chromas/list';

interface Props {
  champ: string;
  skins: SkinBasedChromas[];
  prevSelection: string | null;
  handleSelection: (champ: string, name: string) => void;
}

export const SkinSelection = (props: Props) => {
  const { champ, handleSelection, prevSelection, skins } = props;
  return (
    <div className={`selector-wrapper`}>
      {
        skins.map(skin => (
          <div
            key={skin.name}
            className={`selector--selection ${prevSelection && prevSelection === skin.name ? 'selection--selected' : ''}`}
            onClick={() => handleSelection(champ, skin.name)}
          >
            <img src={skin.imageUrl} alt={skin.name} title={skin.name}/> {skin.name}
          </div>
        ))
      }
    </div>
  )
};