import axios from 'axios';

import {
  getUltimateBraveryChampionsResponseMock,
  getUltimateBraveryDataForChampionResponseMock
} from '../__mocks__/ultimateBraveryResponses';

export interface UltimateBraveryChampion {
  id: number;
  name: string;
  image: string;
}

interface UltimateBraveryChampionsData {
  data: {
    champions: UltimateBraveryChampion[]
  };
}

interface UltimateBraveryChampionsResponse {
  error: boolean;
  response: string;
}

/**
 * Get UltimateBraveryChampions Data
 */
export const getUltimateBraveryChampionData = async (): Promise<UltimateBraveryChampion[] | undefined> => {
  try {
    const { data } = await axios.post<UltimateBraveryChampionsResponse>('./assets/bravery.php', { method: 'getUltimateBraveryChampions' });
    // const data = getUltimateBraveryChampionsResponseMock;
    const responseData: UltimateBraveryChampionsData = JSON.parse(data.response);
    const { champions } = responseData.data;
    return champions;
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}

/**
 * Get UltimateBraveryChampion Data
 */

interface UltimateBraveryChampionRunesStats {
  description: string;
  image: string;
}

export interface UltimateBraveryChampionDetails {
  champion: {
    image: string;
    key: string;
    name: string;
    spell: {
      image: string;
      key: string;
      name: string;
    }
  };
  items: Record<string, string>;
  role: string;
  runes: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    stats: UltimateBraveryChampionRunesStats[];
  };
  summonerSpells: Record<string, string>;
  title: string;
}

interface UltimateBraveryChampionData {
  status: string;
  data: UltimateBraveryChampionDetails;
}

interface UltimateBraveryChampionResponse {
  error: boolean;
  response: string;
}

export const getUltimateBraveryDataForChampion = async (championNames: string[], champions: UltimateBraveryChampion[] | undefined): Promise<UltimateBraveryChampionDetails | undefined> => {
  if (!champions) {
    return;
  }
  const championIds: number[] = champions.filter(c => championNames.indexOf(c.name) >= 0).map(c => c.id);

  try {
    const payload = {
      method: 'getUltimateBraveryDataForChampion',
      payload: {
        map: 11,
        level: 30,
        roles: [0, 1, 2, 3, 4],
        language: 'en',
        champions: championIds
      }
    };
    const { data } = await axios.post<UltimateBraveryChampionResponse>(
      './assets/bravery.php',
      JSON.stringify(payload)
    );
    // const data = getUltimateBraveryDataForChampionResponseMock;
    const responseData: UltimateBraveryChampionData = JSON.parse(data.response);
    return responseData.data;
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}