import React, {useState} from 'react';

import { UltimateBraveryChampionDetails } from './ultimateBraveryAdapter';

import './ultimateBraveryCard.css';

interface Props {
  champion: UltimateBraveryChampionDetails;
}

export const UltimateBraveryCard = (props: Props) => {
  const [open, setOpen] = useState(false);

  const { champion } = props;

  const toggleOpenState = () => setOpen(!open);

  return (
    <div className={`ub__container ${open ? 'ub__container__open' : ''}`}>
      <div className={'ub__container__header'} onClick={toggleOpenState}>Ultimate Bravery</div>
      <div className={'ub--content__flex ub--content__meta'}>
        <img className={'ub__image__large ub__champion__image'} src={champion.champion.image} alt={champion.champion.name} title={champion.champion.name} />
        <div className={'ub--content--head'}>{champion.champion.name}</div>
        <div className={'ub--content--head'}><label>Title:</label> {champion.title}</div>
        <div className={'ub--content--head'}><label>Role:</label> {champion.role}</div>
      </div>
      <div className={'ub--content__flex'}>
        <div className={'ub--content'}>
          <label>Spell</label>
          <div className={'ub--content--wrapper'}>
            <div>{champion.champion.spell.key}</div>
            <div><img className={'ub__image__large'} src={champion.champion.spell.image} alt={champion.champion.spell.name}/></div>
            <div className={'ub--content--wrapper summoner-spells'}>
              {Object.keys(champion.summonerSpells).map((i) => (
                <img className={'ub__image__small'} src={champion.summonerSpells[i]} alt={i} title={i} />
              ))}
            </div>
          </div>
        </div>
        <div className={'ub--content'}>
          <label>Build</label>
          <div className={'ub--content--wrapper'}>
            {Object.keys(champion.items).map((i) => (
              <img className={'ub__image__large ub__image__padding'} src={champion.items[i]} alt={i} title={i} />
            ))}
          </div>
        </div>
      </div>
      <div className={'ub--content'}>
        <label>Runes</label>
        <div className={'ub__runes__wrapper'}>
          <div className={'ub__runes'}>
            {Object.keys(champion.runes.primary).map((i) => (
              <img className={'ub__image__small'} src={`https://www.ultimate-bravery.net/images/runes/${champion.runes.primary[i]}`} alt={i} title={i} />
            ))}
          </div>
          <div className={'ub__runes'}>
            {Object.keys(champion.runes.secondary).map((i) => (
              <img className={'ub__image__small'} src={`https://www.ultimate-bravery.net/images/runes/${champion.runes.secondary[i]}`} alt={i} title={i} />
            ))}
          </div>
          <div className={'ub__runes'}>
            {champion.runes.stats.map((i) => (
              <img className={'ub__image__small'} src={`https://www.ultimate-bravery.net/images/rune-stats/${i.image}`} alt={i.description} title={i.description} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}