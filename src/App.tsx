import React, { useEffect, useState, useRef } from 'react';
import debounce from 'lodash.debounce';

import { shuffle } from './shuffle';
import { listOfChampSkinChroma } from './skin_chromas/list';
import { Checkboxes } from './Checkboxes';
import { loadSkinData } from './skin_chromas/loadAndSaveSkins';

import './App.css';
import './Checkbox.css';
import axios from 'axios';

export interface RoleMapping {
  value: string;
  champs: string[];
}

interface RoleChampMapping {
  role: string;
  champ: string;
}

const LOCAL_STORAGE_KEY = 'lol-randomizer';
const LOCAL_STORAGE_KEY_PROFILE = 'lol-randomizer-profile';
const LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION = 'lol-randomizer-skin-selection';

function App() {
  const [edit, setEdit] = useState(false);
  const [randomRole, setRandomRole] = useState('');
  const [randomAdditionalRole, setRandomAdditionalRole] = useState('');
  const [randomChamp, setRandomChamp] = useState('');
  const [randomAdditionalChamp, setRandomAdditionalChamp] = useState('');
  const [braveryChamp, setBraveryChamp] = useState('');
  const [randomRoleSelected, setRandomRoleSelected] = useState(true);
  const [roles, setRoles] = useState<RoleMapping[]>([{
    value: '',
    champs: [],
  }]);
  const [skinSelectorOpen, setSkinSelectorOpen] = useState(false);
  const [chromaSelectorOpen, setChromaSelectorOpen] = useState(false);
  const [addSkinSelectorOpen, setAddSkinSelectorOpen] = useState(false);
  const [addChromaSelectorOpen, setAddChromaSelectorOpen] = useState(false);
  const [profile, setProfile] = useState('');
  const [bravery, setBravery] = useState(false);
  const allThemChamps = useRef<string[]>([]);
  const skinSelectorRef = useRef(null);
  const addSkinSelectorRef = useRef(null);
  const chromaSelectorRef = useRef(null);
  const addChromaSelectorRef = useRef(null);
  const deselectedRoles = useRef<string[]>([]);

  useEffect(() => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);

      if (!Array.isArray(parsedRoles)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([parsedRoles]));
      }
    }

    const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

    if (profile) {
      setProfile(profile);
      handleProfileDebounce(profile);
    }

    loadSkinData();
    loadAllThemChamps();
  }, []);

  const loadAllThemChamps = async () => {
    const { data } = await axios.get('./assets/allThemChamps.json');
    allThemChamps.current = data;
  };

  const updateAllThemChamps = async (champ: string) => {
    if (allThemChamps) {
      const champs = allThemChamps.current;
      champs.push(champ);
      const sortedArray = (champs as string[]).sort((a, b) => {
        return a.localeCompare(b);
      });
      const dedupedArray = sortedArray.filter((elem, index, self) => {
        return index === self.indexOf(elem);
      });
      await axios.post('./assets/update.php', JSON.stringify(dedupedArray));
      await loadAllThemChamps();
    }
  }

  const handleAddingToAllThemChamps = (e: any) => {
    if (braveryChamp && braveryChamp.length) {
      updateAllThemChamps(braveryChamp);
    }
  }

  const handleProfileDebounce = debounce((profile: string) => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);
      const filteredList = parsedRoles.filter((list: any) => list.profile === profile);
      if (filteredList && filteredList.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, profile);
        setRoles(filteredList[0].list);
      } else {
        setRoles([{
          value: '',
          champs: [],
        }]);
      }
    }
  }, 300);

  const handleUpdateDebounce = debounce((data: any) => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);
      const filteredList = parsedRoles.filter((item: any) => item.profile !== profile);

      filteredList.push({ profile, list: data });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([{ profile, list: data }]));
    }
  }, 300);

  const handleOutsideClick = (e: any) => {
    if (
      skinSelectorRef &&
      !(skinSelectorRef?.current as any)?.contains(e.target) &&
      addSkinSelectorRef &&
      !(addSkinSelectorRef?.current as any)?.contains(e.target) &&
      chromaSelectorRef &&
      !(chromaSelectorRef?.current as any)?.contains(e.target) &&
      addChromaSelectorRef &&
      !(addChromaSelectorRef?.current as any)?.contains(e.target)
    ) {
      setSkinSelectorOpen(false);
      setAddSkinSelectorOpen(false);
      setChromaSelectorOpen(false);
      setAddChromaSelectorOpen(false);
    }
  };

  const updateLocalStorage = (data: any) => {
    handleUpdateDebounce(data);
  }

  const handleInputChange = (index: number, e: any) => {
    const newRoles = [...roles];
    newRoles[index] = {
      value: e.target.value,
      champs: roles[index].champs
    };
    setRoles(newRoles);
    updateLocalStorage(newRoles);
  }

  const handleChampChange = (index: number, e: any) => {
    const newRoles = [...roles];
    const champs = e.target.value.split('\n');
    newRoles[index] = {
      value: newRoles[index].value,
      champs
    };
    setRoles(newRoles);
    updateLocalStorage(newRoles);
  };

  const createRoleMapping = (index: number, role: RoleMapping) => {
    const champString = role.champs.join('\n');
    return (
      <div className={'edit-mode-role'}>
        <div className={'edit-mode-role--input-wrapper'}>
          <input type={'text'} value={role.value} onChange={(e) => handleInputChange(index, e)}/>
          <label className={`role-label ${role.value.length ? 'small' : ''}`}>Role Name</label>
        </div>
        <div className={'edit-mode-role--champs-wrapper'}>
          <label>Champions</label>
          <textarea value={champString} onChange={(e) => handleChampChange(index, e)}/>
        </div>
      </div>
    )
  }

  const addNewRoleMapping = () => {
    const newRoles = [...roles];
    newRoles.push({
      value: '',
      champs: [],
    });
    setRoles(newRoles);
    updateLocalStorage(newRoles);
  }

  const selectRandomRole = (): any => {
    const roleChampList = generateRoleChampList();

    if (!roleChampList.length) {
      return;
    }

    const shuffledRoleChampList = shuffle(roleChampList);
    const randomSelection: RoleChampMapping = shuffledRoleChampList[Math.floor(Math.random() * shuffledRoleChampList.length)];

    if (deselectedRoles.current.indexOf(randomSelection.role) >= 0) {
      return selectRandomRole();
    }

    setRandomRoleSelected(true);
    setBravery(false);
    setRandomRole(randomSelection.role);
    setRandomChamp(randomSelection.champ);
    if (roles.length && roles.length > 1) {
      selectRandomAdditionalRole(roleChampList, randomSelection.role);
    }
  }

  const selectRandomAdditionalRole = (roleChampList:RoleChampMapping[], newRole: string): any => {
    const shuffledRoleChampList = shuffle(roleChampList);
    const randomSelection: RoleChampMapping = shuffledRoleChampList[Math.floor(Math.random() * shuffledRoleChampList.length)];

    if (randomSelection.role === newRole) {
      return selectRandomAdditionalRole(roleChampList, newRole);
    }

    if (deselectedRoles.current.indexOf(randomSelection.role) >= 0) {
      return selectRandomAdditionalRole(roleChampList, randomSelection.role);
    }

    setRandomAdditionalRole(randomSelection.role);
    setRandomAdditionalChamp(randomSelection.champ);
  }

  const generateRoleChampList = (): RoleChampMapping[] => {
    const roleChampList: RoleChampMapping[] = [];

    roles.map(i => {
      const role = i.value;
      const champs = i.champs;
      return champs.map(champ => roleChampList.push({ role, champ }));
    });

    return shuffle(roleChampList);
  }

  const selectRandomFromAll = () => {
    const allTheChamps = allThemChamps.current!;
    const randomChamp: string = allTheChamps[Math.floor(Math.random() * allTheChamps.length)];

    setRandomRoleSelected(false);
    setBravery(true);
    setRandomRole('random');
    setRandomChamp(randomChamp);
  }

  const reRoll = (role: string, champ: string, additional: boolean) => {
    const roleChampList = generateRoleChampList();
    const filteredList = roleChampList.filter(item => item.role === role && item.champ !== champ);
    const randomSelection: RoleChampMapping = filteredList[Math.floor(Math.random() * filteredList.length)];

    if (additional) {
      setRandomAdditionalChamp(randomSelection.champ);
    } else {
      setRandomChamp(randomSelection.champ);
    }
  }

  const skinExists = (champ: string) => {
    return listOfChampSkinChroma.filter(item => item.champ === champ).length;
  };

  const handleSkinSelection = (champ: string, skin: string) => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);
    let parsedSelection: any = {};

    if (currentSelection) {
      parsedSelection = JSON.parse(currentSelection);
    }

    const profileSelection = {
      ...parsedSelection,
      [profile]: {
        ...parsedSelection[profile],
        [champ]: { skin, chroma: parsedSelection[profile] && parsedSelection[profile][champ] ? parsedSelection[profile][champ]?.chroma : '' }
      }
    };

    localStorage.setItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION, JSON.stringify(profileSelection));

    setAddSkinSelectorOpen(false);
    return setSkinSelectorOpen(false);
  }

  const handleChromaSelection = (champ: string, chroma: string) => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);
    let parsedSelection: any = {};

    if (currentSelection) {
      parsedSelection = JSON.parse(currentSelection);
    }

    const profileSelection = {
      ...parsedSelection,
      [profile]: {
        ...parsedSelection[profile],
        [champ]: { skin: parsedSelection[profile] && parsedSelection[profile][champ] ? parsedSelection[profile][champ]?.skin : '', chroma }
      }
    };

    localStorage.setItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION, JSON.stringify(profileSelection));

    setAddChromaSelectorOpen(false);
    return setChromaSelectorOpen(false);
  }

  const getPrevSkinSelection = (champ: string): string | null => {
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);

    if (currentSelection) {
      const parsedSelection = JSON.parse(currentSelection);
      const filteredSelection = parsedSelection[profile];

      return filteredSelection ? filteredSelection[champ]?.skin : null;
    }

    return null;
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

  const generateSkinSelection = (champ: string) => {
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);

    if (champList.length) {
      const skins = champList[0].skins;
      const prevSelection = getPrevSkinSelection(champ);

      return (
        <div className={`selector-wrapper`}>
          {
            skins.map(skin => (
              <div
                key={skin.name}
                className={`selector--selection ${prevSelection && prevSelection === skin.name ? 'selection--selected' : ''}`}
                onClick={() => handleSkinSelection(champ, skin.name)}
              >
                <img src={skin.imageUrl} alt={skin.name} title={skin.name}/> {skin.name}
              </div>
            ))
          }
        </div>
      );
    }

    return null;
  };

  const generateChromaSelection = (champ: string) => {
    const champList = listOfChampSkinChroma.filter(item => item.champ === champ);

    if (champList.length) {
      const skins = champList[0].skins;
      const prevSkin = getPrevSkinSelection(champ);
      const chromasList = skins.filter(i =>  i.name === prevSkin);

      if (chromasList.length) {
        const chromas = chromasList[0].chromas;
        const prevChroma = getPrevChromaSelection(champ);

        return (
          <div className={`selector-wrapper`}>
            {
              chromas.map(chroma => (
                <div
                  key={chroma.name}
                  className={`selector--selection ${prevChroma && prevChroma === chroma.name ? 'selection--selected' : ''}`}
                  onClick={() => handleChromaSelection(champ, chroma.name)}
                >
                  <img src={chroma.imageUrl} alt={chroma.name} title={chroma.name}/> {chroma.name}
                </div>
              ))
            }
          </div>
        );
      }
    }

    return null;
  };

  const handleCheckboxChange = (role: string) => {
    const index = deselectedRoles.current.indexOf(role);

    if (index > -1) {
      return deselectedRoles.current.splice(index, 1);
    } else {
      return deselectedRoles.current.push(role);
    }
  };

  const openSkinSelect = () => setSkinSelectorOpen(true);
  const openChromaSelect = () => setChromaSelectorOpen(true);
  const openAddSkinSelect = () => setAddSkinSelectorOpen(true);
  const openAddChromaSelect = () => setAddChromaSelectorOpen(true);

  const getCurrentChampSelect = (champ: string, additional: boolean) => {
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
          <div className={'champ-selection-wrapper'} onClick={additional ? openAddSkinSelect : openSkinSelect}>
            <img src={skin.imageUrl} alt={skin?.name}/>{skin?.name}
          </div>
        );
      }
    } else {
      return (
        <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={additional ? openAddSkinSelect : openSkinSelect}>
          Select Skin
        </div>
      )
    }
  }

  const getCurrentChromaSelect = (champ: string, additional: boolean) => {
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

        if (profileSelection && profileSelection[champ]) {
          chromas = chromas.filter(c => c.name === (profileSelection[champ].chroma || ''));
        }

        if (chromas.length) {
          return (
            <div className={'champ-selection-wrapper'} onClick={additional ? openAddChromaSelect : openChromaSelect}>
              <img src={chromas[0].imageUrl} alt={chromas[0]?.name}/>{chromas[0]?.name}
            </div>
          );
        } else {
          return (
            <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={additional ? openAddChromaSelect : openChromaSelect}>
              Select Chroma
            </div>
          );
        }
      }
    } else {
      if (champList.length) {
        return (
          <div className={'champ-selection-wrapper champ-selection-wrapper--button'} onClick={additional ? openAddChromaSelect : openChromaSelect}>
            Select Chroma
          </div>
        );
      }
    }
  }

  const handleBraveryChange = (e: any) => {
    setBraveryChamp(e.target.value);
  }

  const handleProfileChange = (e: any) => {
    setProfile(e.target.value);
    setRandomRole('');
    setRandomAdditionalRole('');
    setRandomChamp('');
    setRandomAdditionalChamp('');
    handleProfileDebounce(e.target.value);
  };

  return (
    <div className="App" onClick={handleOutsideClick}>
      <header className="App-header">
        <p>
          <b>LoL Randomizer</b>
        </p>
      </header>
      <section className={'content'}>
        <div className={'content-actions'}>
          <div className={'input-wrapper'}>
            <input type={'text'} value={profile} onChange={handleProfileChange}/>
            <label className={`role-label ${profile.length ? 'small' : ''}`}>Profile</label>
          </div>
          <div className={'content--action'}>
            <button onClick={() => setEdit(!edit)} disabled={!profile || !profile.length}>
              <i className="material-icons">{edit ? 'close' : 'edit'}</i>
            </button>
            <button onClick={selectRandomRole} disabled={!profile || !profile.length}>
              <i className="material-icons">pets</i>
            </button>
            <button onClick={selectRandomFromAll} className={'button-upside-down'} disabled={!profile || !profile.length}>
              <i className="material-icons">group_work</i>
            </button>
          </div>
          <div className={'content--action'}>
            <span>Available Roles: </span>
            <Checkboxes roles={roles} onChange={handleCheckboxChange}/>
          </div>
        </div>


        <div className={'content--selection-wrapper'}>
          <div className={'content--selection-container'}>
            <div className={'content--selection'}>
              {
                randomRole.length && randomChamp.length ? (
                  <>
                    {
                      randomRoleSelected ? (
                        <div className={'content--result'}><span className={'content--result-label'}>Role:</span> {randomRole}</div>
                      ) : null
                    }
                    <div className={'content--result'}><span className={'content--result-label'}>Champ:</span> {randomChamp}</div>
                    {
                      !bravery ? (
                        <div className={'content--result-re-roll'} onClick={() => reRoll(randomRole, randomChamp, false)}>
                          <i className="material-icons">replay</i>
                        </div>
                      ) : null
                    }
                  </>
                ) : null
              }
            </div>
            {
              skinExists(randomChamp) ? (
                <div className={'content--selection-skin-chroma-wrapper'}>
                  <div ref={skinSelectorRef} className={'content--selection-skin-chroma-selector'}>
                    <div className={`flex-wrapper`}>
                      <div className={'label-wrapper'}>Skin:</div>
                      <div>{ getCurrentChampSelect(randomChamp, false) }</div>
                    </div>
                    <div className={`content--selection-skin-chroma-selection ${skinSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                      { generateSkinSelection(randomChamp) }
                    </div>
                  </div>
                  <div ref={chromaSelectorRef} className={'content--selection-skin-chroma-selector'}>
                    <div className={`flex-wrapper`}>
                      <div className={'label-wrapper'}>Chroma:</div>
                      <div>{ getCurrentChromaSelect(randomChamp, false) }</div>
                    </div>
                    <div className={`content--selection-skin-chroma-selection ${chromaSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                      { generateChromaSelection(randomChamp) }
                    </div>
                  </div>
                </div>
              ) : null
            }
          </div>
          {
            randomRoleSelected && randomAdditionalRole.length && randomAdditionalChamp.length ? (
              <div className={'content--selection-container'}>
                <div className={'content--selection'}>
                  <div className={'content--result'}><span className={'content--result-label'}>Role:</span> {randomAdditionalRole}</div>
                  <div className={'content--result'}><span className={'content--result-label'}>Champ:</span> {randomAdditionalChamp}</div>
                  {
                    !bravery ? (
                      <div className={'content--result-re-roll'} onClick={() => reRoll(randomAdditionalRole, randomAdditionalChamp, true)}>
                        <i className="material-icons">replay</i>
                      </div>
                    ) : null
                  }
                </div>
                {
                  skinExists(randomAdditionalChamp) ? (
                    <div className={'content--selection-skin-chroma-wrapper'}>
                      <div ref={addSkinSelectorRef} className={'content--selection-skin-chroma-selector'}>
                        <div className={`flex-wrapper`}>
                          <div className={'label-wrapper'}>Skin:</div>
                          <div>{ getCurrentChampSelect(randomAdditionalChamp, true) }</div>
                        </div>
                        <div className={`content--selection-skin-chroma-selection ${addSkinSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                          { generateSkinSelection(randomAdditionalChamp) }
                        </div>
                      </div>
                      <div ref={addChromaSelectorRef} className={'content--selection-skin-chroma-selector'}>
                        <div className={`flex-wrapper`}>
                          <div className={'label-wrapper'}>Chroma:</div>
                          <div>{ getCurrentChromaSelect(randomAdditionalChamp, true) }</div>
                        </div>
                        <div className={`content--selection-skin-chroma-selection ${addChromaSelectorOpen ? 'content--selection-skin-chroma-selection--open' : ''}`}>
                          { generateChromaSelection(randomAdditionalChamp) }
                        </div>
                      </div>
                    </div>
                  ) : null
                }
              </div>
            ) : null
          }
        </div>
      </section>
      {
        bravery ? (
          <section className={'bravery-input-container'}>
            <div className={'input-wrapper'}>
              <input type={'text'} value={braveryChamp} onChange={handleBraveryChange} onBlur={handleAddingToAllThemChamps}/>
              <label className={`role-label ${braveryChamp.length ? 'small' : ''}`}>Add New Champion</label>
            </div>
          </section>
        ) : null
      }
      <section className={'edit-panel'}>
        {
          edit ? (
            <>
              {roles.map((role: any, i: number) => createRoleMapping(i, role))}
              <div className={'edit-panel--action'}>
                <button onClick={addNewRoleMapping}>
                  <i className="material-icons">add</i>
                </button>
              </div>
            </>
          ) : null
        }
      </section>
    </div>
  );
}

export default App;
