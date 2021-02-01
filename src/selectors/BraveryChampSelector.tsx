import * as React from 'react';
import { useRef, useState } from 'react';

import { AllThemChamps } from '../all-them-champs/AllThemChamps';
import { ChampCard } from '../ChampCard';

import './braveryChampSelector.css';

interface Props {
  allThemChamps: string[];
  selection: string[];
  onSelectionChange: (selection: string[]) => void;
}

/**
 * @param props
 * @constructor
 */
export function BraveryChampSelector(props: Props) {
  const { allThemChamps, selection, onSelectionChange } = props;
  const [selectedChamps, setSelectedChamps] = useState<string[]>(selection);
  const [filter, setFilter] = useState('');
  const champions = useRef(allThemChamps);

  // TODO add function to activate and set champs and return on change
  const handleChange = (champs: string[]) => {
    return onSelectionChange(champs);
  };

  const handleToggleChamp = (champ: string) => {
    const champs = [...selectedChamps];
    const index = champs.indexOf(champ);
    if (index >= 0) {
      champs.splice(index, 1);
    } else {
      champs.push(champ);
    }

    setSelectedChamps(champs);
    return handleChange(champs);
  };

  const handleFilterChange = (e: any) => {
    const value = e.target.value;
    let champs = [...allThemChamps];
    champs = champs.filter(c => c.indexOf(value) >= 0);
    champions.current = champs;
    setFilter(value);
  };

  const handleDeselectAll = () => {
    setSelectedChamps([]);
    onSelectionChange([]);
  }

  const handleSelectAll = () => {
    setSelectedChamps(allThemChamps);
    onSelectionChange(allThemChamps);
  }

  return (
    <>
      <div>
        <div className={'bravery-panel__selection__select-container'}>
          <div className={'bravery-panel__selection__select-headline'}>
            Selected Bravery Champions
            <div className={'bravery-panel__ctas'}>
              <div className={'bravery-panel__cta'} onClick={handleDeselectAll}>Deselect All</div>
              <div> | </div>
              <div className={'bravery-panel__cta'} onClick={handleSelectAll}>Select All</div>
            </div>
          </div>
          <div className={'bravery-panel__selection__select-list'}>
            {!selectedChamps.length ? <div className={'default-text'}>Where them champs at? Hmm .. maybe you need to select at least one from below.</div> : null}
            {
              selectedChamps.map((champ, key) => (
                <React.Fragment key={`${champ}-${key}`}>
                  <ChampCard champ={champ} handleOnClick={handleToggleChamp} />
                </React.Fragment>
              ))
            }
          </div>
        </div>
      </div>
      <div>
        <div className={'bravery-panel__selection__all-them-champs'}>
          {
            <>
              <div className={'input-wrapper'}>
                <input type={'text'} value={filter} onChange={handleFilterChange} />
                <label className={`role-label ${filter.length ? 'small' : ''}`}>Filter Champions</label>
              </div>
              <AllThemChamps allThemChamps={champions.current} onToggleChamp={handleToggleChamp} />
            </>
          }
        </div>
      </div>
    </>
  )
}