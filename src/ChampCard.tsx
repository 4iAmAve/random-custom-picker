import * as React from 'react';

import './ChampCard.css';

interface Props {
  champ: string;
  handleOnClick: (champ: string) => void;
}

export const ChampCard = (props: Props) => {
  const { champ, handleOnClick } = props;
  const name = champ ? champ.toLowerCase() : null;
  const cleanName = name ? name.replace(/[^a-zA-Z]/g, '') : '';

  return (
    <div className={'champ-card__champ'} onClick={() => handleOnClick(champ)}>
      <div className={'champ-card__champ-name'}>
        <img src={`https://fastcdn.mobalytics.gg/assets/lol/images/dd/champions/icons/${cleanName}.png`} />
        <div>{champ}</div>
      </div>
    </div>
  )
};