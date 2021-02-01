import { ahriSkins } from './Ahri';
import { asheSkins } from './Ashe';
import { caitlynSkins } from './Caitlyn';
import { jannaSkins } from './Janna';
import { luxSkins } from './Lux';
import { yuumiSkins } from './Yuumi';
import { jinxSkins } from './Jinx';
import { sivirSkins } from './Sivir';
import { morganaSkins } from './Morgana';
import { namiSkins } from './Nami';
import { tristanaSkins } from './Tristana';
import { katarinaSkins } from './Katarina';

export interface Chroma {
  name: string;
  imageUrl: string;
}

export interface SkinBasedChromas {
  chromas: Chroma[]
  combinations?: string;
  imageUrl: string;
  name: string;
}

export interface ChampBasedSkins {
  champ: string;
  skins: SkinBasedChromas[];
}

export const listOfChampSkinChroma: ChampBasedSkins[] = [
  {
    champ: 'Ahri',
    skins: ahriSkins
  },
  {
    champ: 'Yuumi',
    skins: yuumiSkins
  },
  {
    champ: 'Janna',
    skins: jannaSkins
  },
  {
    champ: 'Ashe',
    skins: asheSkins
  },
  {
    champ: 'Caitlyn',
    skins: caitlynSkins
  },
  {
    champ: 'Lux',
    skins: luxSkins
  },
  {
    champ: 'Jinx',
    skins: jinxSkins
  },
  {
    champ: 'Sivir',
    skins: sivirSkins
  },
  {
    champ: 'Morgana',
    skins: morganaSkins
  },
  {
    champ: 'Nami',
    skins: namiSkins
  },
  {
    champ: 'Tristana',
    skins: tristanaSkins
  },
  {
    champ: 'Katarina',
    skins: katarinaSkins
  },
];