import * as React from 'react';

import { ChampCard } from '../ChampCard';

import './allThemChamps.css';

interface Props {
  allThemChamps: string[];
  onToggleChamp?: (champ: string) => void;
}

export function AllThemChamps(props: Props) {
  const { allThemChamps, onToggleChamp } = props;

  const handleOnClick = (champ: string) => {
    if (onToggleChamp) {
      onToggleChamp(champ);
    }
  }

  return (
    <div className={'all-them-champs-container'}>
      {
        allThemChamps.map((champ, key) => (
          <React.Fragment key={`${champ}-${key}`}>
            <ChampCard champ={champ} handleOnClick={handleOnClick} />
          </React.Fragment>
        ))
      }
    </div>
  );
}