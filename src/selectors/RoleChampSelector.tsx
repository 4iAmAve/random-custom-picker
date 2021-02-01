import * as React from 'react';
import { useRef, useState } from 'react';

import { Checkbox } from '../Checkbox';
import { AllThemChamps } from '../all-them-champs/AllThemChamps';
import { Role } from '../Roles';
import { ChampCard } from '../ChampCard';

import './RoleChampSelector.css';

interface Props {
  allThemChamps: string[];
  name: Role;
  selected: boolean;
  selection: string[];
  onSelectionChange: (role: Role, active: boolean, selection: string[]) => void;
}

/**
 * @param props
 * @constructor
 */
export function RoleChampSelector(props: Props) {
  const { allThemChamps, name, selected, selection, onSelectionChange } = props;
  const [selectedChamps, setSelectedChamps] = useState<string[]>(selection);
  const [active, setActive] = useState(selected);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const champions = useRef(allThemChamps);

  // TODO add function to activate and set champs and return on change
  const handleChange = (active: boolean, champs: string[]) => {
    return onSelectionChange(name, active, champs);
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
    return handleChange(active, champs);
  };

  const handleActiveChange = () => {
    setActive(!active);
    return handleChange(!active, selectedChamps);
  };

  const handleFilterChange = (e: any) => {
    const value = e.target.value;
    let champs = [...allThemChamps];
    champs = champs.filter(c => c.indexOf(value) >= 0);
    champions.current = champs;
    setFilter(value);
  };

  const toggleOpenState = () => setOpen(!open);

  return (
    <div className={`edit-panel__selection ${open ? 'edit-panel__selection--open' : ''}`}>
      <div className={'edit-panel__selection__header'} onClick={toggleOpenState}>
        <Checkbox
          id={1}
          role={name}
          selected={active}
          onDeselect={handleActiveChange}
        />
      </div>
      <div>
        <div className={'edit-panel__selection__select-container'}>
          <div className={'edit-panel__selection__select-headline'}>Selected</div>
          <div className={'edit-panel__selection__select-list'}>
            {!selectedChamps.length ? <div className={'default-text'}>Where them champs at? Hmm .. maybe you need to select at least one from below.</div> : null}
            {
              open && selectedChamps.map((champ, key) => (
                <React.Fragment key={`${champ}-${key}`}>
                  <ChampCard champ={champ} handleOnClick={handleToggleChamp} />
                </React.Fragment>
              ))
            }
          </div>
        </div>
      </div>
      <div>
        <div className={'edit-panel__selection__all-them-champs'}>
          {
            open ? (
              <>
                <div className={'input-wrapper'}>
                  <input type={'text'} value={filter} onChange={handleFilterChange} />
                  <label className={`role-label ${filter.length ? 'small' : ''}`}>Filter Champions</label>
                </div>
                <AllThemChamps allThemChamps={champions.current} onToggleChamp={handleToggleChamp} />
              </>
            ) : null
          }
        </div>
      </div>
    </div>
  )
}