import * as React from 'react';
import {useEffect, useRef, useState} from 'react';

import { listOfChampSkinChroma } from '../skin_chromas/list';
import { SkinSelection } from './SkinSelection';
import { ChromaSelection } from './ChromaSelection';
import { RandomChromaSuggestion } from '../RandomChromaSuggestion';
import { deepClone } from '../deepClone';

interface Props {
  additional: boolean;
  bravery: boolean;
  champ: string;
  profile: string;
  role: string;
  selected: boolean;
  onReRoll: (role: string, champ: string, additional: boolean) => void;
  onChromaSelectionChange: (champ: string, chroma: string) => void;
  onSkinSelectionChange: (champ: string, skin: string) => void;
}

const LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION = 'lol-randomizer-skin-selection';

export function SelectionCard(props: Props) {
  const { additional, bravery, champ, profile, role, selected, onChromaSelectionChange, onReRoll, onSkinSelectionChange } = props;
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false);
  const [chromaSelectorOpen, setChromaSelectorOpen] = useState(false);
  const skinSelectorRef = useRef(null);
  const chromaSelectorRef = useRef(null);
  const addRandomChromaSelectorRef = useRef(null);
  const selectedChampChromaCombination = useRef<string | null>(null);

  useEffect(() => {
    console.log('listOfChampSkinChroma', listOfChampSkinChroma);
  }, []);

  const openSkinSelect = () => setSkinSelectorOpen(true);
  const openChromaSelect = () => setChromaSelectorOpen(true);

  const getCurrentChampSelect = (champ: string) => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);

    if (champList.length && currentSelection) {
      const parsedSelection = JSON.parse(currentSelection);
      const profileSelection = parsedSelection[profile];
      let skins = champList[0].skins;

      if (profileSelection && profileSelection[champ]) {
        skins = skins.filter(i => i.name === (profileSelection[champ].skin || ''))
      }

      if (skins.length) {
        const skin = skins[0];
        return (
          <div className={'champ-selection-wrapper'} onClick={openSkinSelect}>
            <img src={skin.imageUrl} alt={skin?.name}/>{skin?.name}
          </div>
        );
      }
    } else {
      return (
        <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={openSkinSelect}>
          Select Skin
        </div>
      )
    }
  };

  const skinExists = (champ: string) => {
    return listOfChampSkinChroma.filter(item => item.champ === champ).length;
  };

  const getPrevSkinSelection = (champ: string): string | null => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);

    if (currentSelection) {
      const parsedSelection = JSON.parse(currentSelection);
      const filteredSelection = parsedSelection[profile];

      return filteredSelection ? filteredSelection[champ]?.skin : null;
    }

    return null;
  }

  const handleSkinSelection = (champ: string, skin: string) => {
    onSkinSelectionChange(champ, skin);
    setSkinSelectorOpen(false);
  };

  const generateSkinSelection = (champ: string) => {
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);

    if (champList.length) {
      const skins = champList[0].skins;
      const prevSelection = getPrevSkinSelection(champ);

      return (
        <SkinSelection champ={champ} skins={skins} prevSelection={prevSelection} handleSelection={handleSkinSelection} />
      );
    }

    return null;
  };


  /**
   * CHROMA
   */
  const handleChromaSelection = (champ: string, chroma: string) => {
    onChromaSelectionChange(champ, chroma);
    setChromaSelectorOpen(false);
  };

  const getCurrentChromaSelect = (champ: string) => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);

    if (champList.length && currentSelection) {
      const parsedSelection = JSON.parse(currentSelection);
      const profileSelection = parsedSelection[profile];
      let skins = champList[0].skins;

      if (profileSelection && profileSelection[champ]) {
        skins = skins.filter(i => i.name === (profileSelection[champ].skin || ''))
      }

      if (skins.length) {
        let chromas = skins[0].chromas;

        if (skins[0]?.combinations) {
          selectedChampChromaCombination.current = skins[0]?.combinations;
        } else {
          selectedChampChromaCombination.current = null;
        }

        if (profileSelection && profileSelection[champ]) {
          chromas = chromas.filter(c => c.name === (profileSelection[champ].chroma || ''));
        }

        if (chromas.length) {
          return (
            <div className={'champ-selection-wrapper'} onClick={openChromaSelect}>
              <img src={chromas[0].imageUrl} alt={chromas[0]?.name}/>{chromas[0]?.name}
            </div>
          );
        } else {
          return (
            <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={openChromaSelect}>
              Select Chroma
            </div>
          );
        }
      }
    } else {
      if (champList.length) {
        return (
          <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={openChromaSelect}>
            Select Chroma
          </div>
        );
      }
    }
  }

  const getPrevChromaSelection = (champ: string): string => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);

    if (currentSelection) {
      const parsedSelection = JSON.parse(currentSelection);
      const filteredSelection = parsedSelection[profile];

      return filteredSelection ? filteredSelection[champ]?.chroma : '';
    }

    return '';
  }

  const generateChromaSelection = (champ: string) => {
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);
    console.log('listOfChampSkinChroma', listOfChampSkinChroma);
    console.log('champList', champList);

    if (champList.length) {
      const skins = champList[0].skins;
      const prevSkin = getPrevSkinSelection(champ);
      const chromasList = skins.filter(i =>  i.name === prevSkin);
      console.log('skins', skins);
      console.log('prevSkin', prevSkin);
      console.log('chromasList', chromasList);

      if (chromasList.length) {
        const chromas = chromasList[0].chromas;
        const prevChroma = getPrevChromaSelection(champ);

        console.log('ssss', chromas, prevChroma);

        return (
          <ChromaSelection champ={champ} chromas={chromas} prevChroma={prevChroma} onChromaSelection={handleChromaSelection} />
        );
      }
    }

    return null;
  };

  const getRandomChromaSuggestion = (champ: string) => {
    const clonedList = deepClone(listOfChampSkinChroma);
    const champList = clonedList.find(item => item.champ === champ);

    if (champList) {
      let skins = champList.skins;
      const prevSkin = getPrevSkinSelection(champ);
      const chromasList = skins.find(i =>  i.name === prevSkin);

      if (chromasList) {
        let chromas = chromasList.chromas;
        chromas.push({
          imageUrl: chromasList.imageUrl,
          name: chromasList.name,
        });
        const randomChroma = chromas[Math.floor(Math.random() * chromas.length)];

        return (
          <RandomChromaSuggestion chroma={randomChroma} />
        );
      }
    }

    return null;
  };

  return (
    <div className={'content--selection-container'}>
      <div className={'content--selection'}>
        {
          role.length && champ.length ? (
            <>
              {
                selected ? (
                  <div className={'content--result'}><span className={'content--result-label'}>Role:</span> {role}</div>
                ) : null
              }
              <div className={'content--result'}><span className={'content--result-label'}>Champ:</span> {champ}</div>
              {
                !bravery ? (
                  <div className={'content--result-re-roll'} onClick={() => onReRoll(role, champ, additional)}>
                    <i className="material-icons">replay</i>
                  </div>
                ) : null
              }
            </>
          ) : null
        }
      </div>
      {
        skinExists(champ) ? (
          <div className={'content--selection-skin-chroma-wrapper'}>
            <div ref={skinSelectorRef} className={'content--selection-skin-chroma-selector'}>
              <div className={`flex-wrapper`}>
                <div className={'label-wrapper'}>Skin:</div>
                <div>{ getCurrentChampSelect(champ) }</div>
              </div>
              <div className={`content--selection-skin-chroma-selection ${skinSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                { generateSkinSelection(champ) }
              </div>
            </div>
            <div ref={chromaSelectorRef} className={'content--selection-skin-chroma-selector'}>
              <div className={`flex-wrapper`}>
                <div className={'label-wrapper'}>Chroma:</div>
                <div>{ getCurrentChromaSelect(champ) }</div>
              </div>
              <div className={`content--selection-skin-chroma-selection ${chromaSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                { generateChromaSelection(champ) }
              </div>
            </div>
            <div ref={addRandomChromaSelectorRef} className={'content--selection-skin-chroma-selector'}>
              <div className={`flex-wrapper`}>
                <div className={'label-wrapper'}>Random Chroma:</div>
                <div>{ getRandomChromaSuggestion(champ) }</div>
              </div>
            </div>
            {
              selectedChampChromaCombination.current ? (
                <div className={'content--selection-skin-chroma-selector'}>
                  <div className={`flex-wrapper`}>
                    <div className={'label-wrapper'}>Combinations:</div>
                    <div>
                      <img
                        className={'content--selection-skin-chroma-selector-combination'}
                        src={selectedChampChromaCombination.current}
                        alt={''}
                      /></div>
                  </div>
                </div>
              ) : null
            }
          </div>
        ) : null
      }
    </div>
  );
}