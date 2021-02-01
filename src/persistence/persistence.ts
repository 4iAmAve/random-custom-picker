import axios from "axios";

export interface RoleMapping {
  active: boolean;
  champs: string[];
  value: string;
}

export interface ProfileListMapping {
  profile: string;
  list: RoleMapping[];
}

interface Persistence {
  randomizer: ProfileListMapping[];
}

export const persist = async (data: Persistence) => {
  try {
    await axios.post('./assets/persist.php', JSON.stringify(data));
  } catch (e: any) {
    console.error('Persisting data failed', e);
  }
}

export const getPersistence = async () => {
  try {
    const { data } = await axios.get('./assets/backup.json');
    console.log('peristed data', data);
    return data;
  } catch (e: any) {
    console.error('Get persisted data failed', e);
  }
}
