import React, {useEffect, useRef, useState} from 'react';
import debounce from 'lodash.debounce';
import axios from 'axios';

import { shuffle } from './shuffle';
import { loadSkinData } from './skin_chromas/loadAndSaveSkins';
import { RoleChampSelector } from './selectors/RoleChampSelector';
import { Role } from './Roles';
import { SelectionCard } from './selectors/SelectionCard';
import { UltimateBraveryCard } from './ultimate-bravery/UltimateBraveryCard';
import {
  getUltimateBraveryChampionData, getUltimateBraveryDataForChampion,
  UltimateBraveryChampionDetails,
  UltimateBraveryChampion
} from './ultimate-bravery/ultimateBraveryAdapter';
import { BraveryChampSelector } from "./selectors/BraveryChampSelector";
import { BanSelectionCard } from "./selectors/BanSelectionCard";
import { getPersistence, persist, RoleMapping } from './persistence/persistence';

import './App.css';
import './Checkbox.css';
import {ProfileSuggestion} from "./ProfileSuggestion";

interface RoleChampMapping {
  role: string;
  champ: string;
}

/* deprecated */
const LOCAL_STORAGE_KEY = 'lol-randomizer';
const LOCAL_STORAGE_KEY_BRAVERY = 'lol-randomizer-bravery';
const LOCAL_STORAGE_KEY_CHAMPIONS = 'lol-randomizer-champions';
const LOCAL_STORAGE_KEY_PROFILE = 'lol-randomizer-profile';
const LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION = 'lol-randomizer-skin-selection';
const ONE_DAY_CACHE = 86400000 // on day

interface AllChampionsStorageData {
  champions: UltimateBraveryChampion[];
  timestamp: Date;
}

const availableRoles = [Role.TOP, Role.JUNGLE, Role.MID, Role.SUPPORT, Role.ADC];

function App() {
  const [edit, setEdit] = useState(false);
  const [randomRoleSelected, setRandomRoleSelected] = useState(true);
  const [profile, setProfile] = useState('');
  const [bravery, setBravery] = useState(false);
  const [profileSuggestionVisible, setProfileSuggestionVisible] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [profileNameChangeActive, setProfileNameChangeActive] = useState(false);
  const [updated, setUpdated] = useState(new Date().getTime());
  const [allThemChamps, setAllThemChamps] = useState<string[]>([]);
  const deselectedRoles = useRef<string[]>([]);
  const profileExists = useRef<boolean>(false);
  const randomRole = useRef<string>('');
  const randomAdditionalRole = useRef<string>('');
  const randomChamp = useRef<string>('');
  const randomAdditionalChamp = useRef<string>('');
  const ultimateBraveryChampion = useRef<UltimateBraveryChampionDetails | undefined>(undefined);
  const ultimateBraveryChampions = useRef<UltimateBraveryChampion[] | undefined>(undefined);
  const braveryChampions = useRef<string[]>([]);
  const availableProfiles = useRef<string[]>([]);
  const roles = useRef<RoleMapping[]>([{
    active: false,
    champs: [],
    value: Role.ADC,
  }]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    console.debug(updated);
  }, [updated]);

  const init = async () => {
    await loadBraveryData();

    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);

      if (!Array.isArray(parsedRoles)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([parsedRoles]));
      } else {
        const profiles: string[] = [];
        parsedRoles.map((r) => profiles.push(r.profile));
        // @ts-ignore
        availableProfiles.current = [...new Set(profiles)];
      }
    } else {
      const persistedProfiles = await getPersistence();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(persistedProfiles));
    }

    const profile = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);

    if (profile) {
      profileExists.current = true;
      setProfile(profile);
      setNewProfileName(profile);
      handleProfileDebounce(profile);
    }

    if (savedRoles && profile) {
      persist(JSON.parse(savedRoles));
    }

    loadSkinData();
  }

  const loadBraveryData = async () => {
    let champions: UltimateBraveryChampion[] | undefined = [];
    const savedChampions = localStorage.getItem(LOCAL_STORAGE_KEY_CHAMPIONS);
    if (savedChampions) {
      const parsedChamps: AllChampionsStorageData = JSON.parse(savedChampions);
      const overdue = new Date().getTime() - ONE_DAY_CACHE;
      if (new Date(parsedChamps.timestamp).getTime() < overdue) {
        champions = await loadAndPersistChamps();
      } else {
        champions = parsedChamps.champions;
      }
    } else {
      champions = await loadAndPersistChamps();
    }
    ultimateBraveryChampions.current = champions;
    setAllThemChampsData(champions);
  }

  const setAllThemChampsData = async (champions: UltimateBraveryChampion[] | undefined) => {
    if (champions) {
      const allChampNames = champions?.map(c => c.name);
      // const { data } = await axios.get('./assets/allThemChamps.json');
      setAllThemChamps(allChampNames);
    }
  };

  const loadAndPersistChamps = async (): Promise<UltimateBraveryChampion[]> => {
    const champions = await getUltimateBraveryChampionData();
    if (champions) {
      await axios.post('./assets/update.php', JSON.stringify(champions));

      localStorage.setItem(LOCAL_STORAGE_KEY_CHAMPIONS, JSON.stringify({
        champions,
        timestamp: new Date(),
      }));
    }

    return champions || [];
  }

  /*
  const updateAllThemChamps = async (champions: UltimateBraveryChampions[] | undefined) => {
    if (allThemChamps) {
      const champs = allThemChamps;
      champs.push(champ);
      const sortedArray = (champs as string[]).sort((a, b) => {
        return a.localeCompare(b);
      });
      const dedupedArray = sortedArray.filter((elem, index, self) => {
        return index === self.indexOf(elem);
      });
      await axios.post('./assets/update.php', JSON.stringify(dedupedArray));
      await loadAllThemChamps();
      setBraveryChamp('');
    }
  }

  const handleAddingToAllThemChamps = (e: any) => {
    if (braveryChamp && braveryChamp.length) {
      updateAllThemChamps(braveryChamp);
    }
  }
  */
  const handleProfileSelectionDebounce = debounce((profile: string) => {
    resetProfileData();
    setProfile(profile);
    setNewProfileName(profile);
    handleProfileDebounce(profile);
  }, 100);

  const handleProfileDebounce = debounce((profile: string) => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);
      const filteredList = parsedRoles.filter((list: any) => list.profile === profile);
      if (filteredList && filteredList.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, profile);
        profileExists.current = true;
        roles.current = filteredList[0].list;
      } else {
        roles.current = [{
          active: false,
          champs: [],
          value: Role.ADC,
        }];
      }
      setUpdated(new Date().getTime());
    }
  }, 300);

  const updateLocalStorage = (data: any) => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedRoles) {
      const parsedRoles = JSON.parse(savedRoles);
      const filteredList = parsedRoles.filter((item: any) => item.profile !== profile);

      filteredList.push({ profile, list: data });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredList));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([{ profile, list: data }]));
    }
  };

  const updateLocalBraveryStorage = (data: any) => {
    const savedBraveryData = localStorage.getItem(LOCAL_STORAGE_KEY_BRAVERY);

    if (savedBraveryData) {
      const parsedRoles = JSON.parse(savedBraveryData);
      const filteredList = parsedRoles.filter((item: any) => item.profile !== profile);

      filteredList.push({ profile, list: data });

      localStorage.setItem(LOCAL_STORAGE_KEY_BRAVERY, JSON.stringify(filteredList));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY_BRAVERY, JSON.stringify([{ profile, list: data }]));
    }
  };

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

    randomRole.current = randomSelection.role;
    randomChamp.current = randomSelection.champ;
    setRandomRoleSelected(true);
    setBravery(false);
    setEdit(false);
    if (roles.current.length && roles.current.length > 1) {
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

    randomAdditionalRole.current = randomSelection.role;
    randomAdditionalChamp.current = randomSelection.champ;
    setUpdated(new Date().getTime());
  }

  const generateRoleChampList = (): RoleChampMapping[] => {
    const roleChampList: RoleChampMapping[] = [];

    roles.current.map(i => {
      if (availableRoles.indexOf(i.value as Role) >= 0 && i.active) {
        const role = i.value;
        const champs = i.champs;
        return champs.map(champ => roleChampList.push({ role, champ }));
      }
      return false;
    });

    return shuffle(roleChampList);
  }

  const selectBraveryChampion = async () => {
    const storedBraveryData = localStorage.getItem(LOCAL_STORAGE_KEY_BRAVERY);
    if (storedBraveryData) {
      const parsedData = JSON.parse(storedBraveryData);
      const profileData = parsedData.find((d: any) => d.profile === profile);
      if (profileData) {
        braveryChampions.current = profileData.list;
      }
    }

    const allTheChamps = allThemChamps!;
    const randomChampion: string = allTheChamps[Math.floor(Math.random() * allTheChamps.length)];

    randomRole.current = 'random';
    randomChamp.current = randomChampion;
    ultimateBraveryChampion.current = await getUltimateBraveryDataForChampion(braveryChampions.current, ultimateBraveryChampions.current);
    setRandomRoleSelected(false);
    setProfileNameChangeActive(false);
    setBravery(true);
    setEdit(false);
    setUpdated(new Date().getTime());
  }

  const reRoll = (role: string, champ: string, additional: boolean) => {
    const roleChampList = generateRoleChampList();
    const filteredList = roleChampList.filter(item => item.role === role && item.champ !== champ);
    const randomSelection: RoleChampMapping = filteredList[Math.floor(Math.random() * filteredList.length)];

    if (additional) {
      randomAdditionalChamp.current = randomSelection.champ;
    } else {
      randomChamp.current = randomSelection.champ;
    }
    setUpdated(new Date().getTime());
  }

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

    profileExists.current = true;
    return localStorage.setItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION, JSON.stringify(profileSelection));
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

    profileExists.current = true;
    return localStorage.setItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION, JSON.stringify(profileSelection));
  }

  /*
  const handleCheckboxChange = (role: string) => {
    const index = deselectedRoles.current.indexOf(role);

    if (index > -1) {
      return deselectedRoles.current.splice(index, 1);
    } else {
      return deselectedRoles.current.push(role);
    }
  };

  const handleBraveryChange = (e: any) => {
    setBraveryChamp(e.target.value);
  }
  */

  const handleProfileChange = (e: any) => {
    resetProfileData();
    setProfile(e.target.value);
    setNewProfileName(e.target.value);
    handleProfileDebounce(e.target.value);
  };

  const resetProfileData = () => {
    profileExists.current = false;
    randomRole.current = '';
    randomAdditionalRole.current = '';
    randomChamp.current = '';
    randomAdditionalChamp.current = '';
  }

  const toggleEdit = () => {
    setEdit(!edit);
    setBravery(false);
  };

  const handleBraveryChampSelection = (champs: string[]) => {
    profileExists.current = true;
    braveryChampions.current = champs;
    updateLocalBraveryStorage(champs);
  };

  const handleRoleChampSelectionChange = (role: Role, active: boolean, champs: string[]) => {
    let rolesData = [...roles.current];
    rolesData = rolesData.filter(r => r.value !== role);
    rolesData.push({
      active,
      champs,
      value: role,
    });
    roles.current = rolesData;
    profileExists.current = true;
    updateLocalStorage(roles.current);
  };

  const saveNewProfileName = () => {
    const savedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);
    const currentProfile = profile;

    if (savedRoles) {
      // Update Champ selection list
      const parsedRoles = JSON.parse(savedRoles);
      const filteredList = parsedRoles.find((list: any) => list.profile === profile);
      const filteredWithoutCurrentProfile = parsedRoles.filter((list: any) => list.profile !== profile);
      if (filteredList) {
        const newList = [
          ...filteredWithoutCurrentProfile,
          {
            list: filteredList.list,
            profile: newProfileName,
          },
        ];
        profileExists.current = true;
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, newProfileName);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
        setProfile(newProfileName);
        setProfileNameChangeActive(false);
      }
    }

    // Update Chroma selection list
    const currentSelection = localStorage.getItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION);
    let parsedSelection: any = {};

    if (currentSelection) {
      parsedSelection = JSON.parse(currentSelection);
      const chromaSelection = parsedSelection[currentProfile];

      if (chromaSelection) {
        const profileSelection = {
          ...parsedSelection,
          [newProfileName]: parsedSelection[currentProfile],
        };
        delete profileSelection[currentProfile];
        localStorage.setItem(LOCAL_STORAGE_KEY_SKIN_CHROMA_SELECTION, JSON.stringify(profileSelection));
      }
    }
    setUpdated(new Date().getTime());
  }

  const handleNewProfileChange = (e: any) => {
    setNewProfileName(e.target.value);
  };

  const toggleProfileSuggestionVisible = () => setProfileSuggestionVisible(true);
  const toggleProfileSuggestionHide = () => setProfileSuggestionVisible(false);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <b>LoL Randomizer</b>
        </p>
      </header>
      <section className={'content'}>
        <div className={'content-actions'}>
          <div className={'input-wrapper profile-input'}>
            <input type={'text'} value={profile} onChange={handleProfileChange} onFocus={toggleProfileSuggestionVisible} onBlur={toggleProfileSuggestionHide}/>
            <label className={`role-label ${profile.length ? 'small' : ''}`}>Profile</label>
            <ProfileSuggestion
              profile={profile}
              profiles={availableProfiles.current}
              visible={profileSuggestionVisible}
              onSelect={handleProfileSelectionDebounce}
            />
          </div>
          <div className={'content--action'}>
            <button onClick={toggleEdit} disabled={!profile || !profile.length}>
              <i className="material-icons">{edit ? 'close' : 'edit'}</i>
            </button>
            <button onClick={selectRandomRole} disabled={!profile || !profile.length}>
              <i className="material-icons">pets</i>
            </button>
            <button onClick={selectBraveryChampion} className={'button-upside-down'}>
              <i className="material-icons">group_work</i>
            </button>
            <button onClick={() => setProfileNameChangeActive(!profileNameChangeActive)} className={'button-upside-down'}  disabled={!profile || !profile.length}>
              <i className="material-icons">smart_button</i>
            </button>
          </div>
          {
            profile && profile.length && profileExists.current ? (
              <div className={'content--action exists--information'}>
                <div className={'exists--information__icon'}><i className="material-icons">done</i></div>
              </div>
            ) : null
          }
        </div>

        {profileNameChangeActive ? (
            <div>
              <section className={'bravery-input-container'}>
                <div className={'input-wrapper'}>
                  <input type={'text'} value={newProfileName} onChange={handleNewProfileChange} />
                  <label className={`role-label ${newProfileName.length ? 'small' : ''}`}>Edit Profile Name</label>
                </div>
                <div className={'input-wrapper cta'}>
                  <button onClick={saveNewProfileName}>
                    <i className="material-icons">save</i>
                    <div>Save</div>
                  </button>
                </div>
              </section>
            </div>
          ) : null
        }

        <div className={'content--selection-wrapper'}>
          <SelectionCard
            additional={false}
            bravery={bravery}
            champ={randomChamp.current}
            profile={profile}
            role={randomRole.current}
            selected={randomRoleSelected}
            onReRoll={reRoll}
            onChromaSelectionChange={handleChromaSelection}
            onSkinSelectionChange={handleSkinSelection}
          />
          {
            randomRoleSelected && randomAdditionalRole.current.length && randomAdditionalChamp.current.length ? (
              <SelectionCard
                additional={true}
                bravery={bravery}
                champ={randomAdditionalChamp.current}
                profile={profile}
                role={randomAdditionalRole.current}
                selected={randomRoleSelected}
                onReRoll={reRoll}
                onChromaSelectionChange={handleChromaSelection}
                onSkinSelectionChange={handleSkinSelection}
              />
            ) : null
          }
        </div>

        {randomChamp.current ? (
          <div className={'content--selection-wrapper'}>
            <BanSelectionCard allThemChamps={allThemChamps} selectedChamps={[randomChamp.current, randomAdditionalChamp.current]} />
          </div>
        ) : null}
      </section>
      {
        profile && profile.length && bravery && ultimateBraveryChampion.current ? (
          <section className={'bravery-selection-container'}>
            <UltimateBraveryCard champion={ultimateBraveryChampion.current} />
          </section>
        ) : null
      }
      {/*
        profile && profile.length && bravery ? (
          <section className={'bravery-input-container'}>
            <div className={'input-wrapper'}>
              <input type={'text'} value={braveryChamp} onChange={handleBraveryChange} />
              <label className={`role-label ${braveryChamp.length ? 'small' : ''}`}>Add New Champion</label>
            </div>
            <div className={'input-wrapper cta'}>
              <button onClick={handleAddingToAllThemChamps}>
                <i className="material-icons">save</i>
                <div>Save</div>
              </button>
            </div>
          </section>
        ) : null
      */}
      {
        profile && profile.length && bravery ? (
          <section className={'bravery-input-container'}>
            <BraveryChampSelector
              allThemChamps={allThemChamps}
              selection={braveryChampions.current}
              onSelectionChange={handleBraveryChampSelection}
            />
          </section>
        ) : null
      }
      <section className={'edit-panel'}>
        {
          edit ? availableRoles.map(role => {
            const roleData = roles.current.find(r => r.value === role);
            return (
              <RoleChampSelector
                allThemChamps={allThemChamps}
                name={role}
                selected={roleData?.active || false}
                selection={roleData?.champs || []}
                onSelectionChange={handleRoleChampSelectionChange}
              />
            )}
          ) : null
        }
      </section>
    </div>
  );
}

export default App;
