import * as React from 'react';
import {useEffect, useRef, useState} from 'react';

import { listOfChampSkinChroma } from '../skin_chromas/list';
import { SkinSelection } from './SkinSelection';
import { ChromaSelection } from './ChromaSelection';
import { RandomChromaSuggestion } from '../RandomChromaSuggestion';

interface Props {
  allThemChamps: string[];
  selectedChamps: string[];
}

interface Ban {
  bannableChamp: string | undefined;
  bannableOffense: string | undefined;
}

const BANNABLE_OFFENSES = ['murder', 'mobbing', 'camping', 'slugging', 'agreeing with Ave', 'disagreeing with BriZZ', 'tunneling', 'streamsniping', 'teabagging', 'bodyblocking', 'looping', 'bleeding', 'speaking', 'being David', 'MAULLL', 'HURENSOHN', 'Chugga Chugga Chugga, Chugga Chugga Chugga, Choo Choo', 'killing birds with a GTR'];

export function BanSelectionCard(props: Props) {
  const { allThemChamps, selectedChamps } = props;
  const [ ban, setBan ] = useState<Ban>({
    bannableChamp: undefined,
    bannableOffense: undefined
  });

  useEffect(() => {
    const bannableChamps = allThemChamps.filter(c => selectedChamps.indexOf(c) < 0);
    const bannableChamp: string = bannableChamps[Math.floor(Math.random() * bannableChamps.length)];
    const bannableOffense: string = BANNABLE_OFFENSES[Math.floor(Math.random() * BANNABLE_OFFENSES.length)];
    setBan({
      bannableChamp,
      bannableOffense
    });
  }, [allThemChamps, selectedChamps])

  return ban.bannableChamp?.length ? (
    <div className={'content--selection-container'}>
      <div className={'content--selection'}>
        <div className={'content--result'}><span className={'content--result-label'}>Ban for {ban.bannableOffense}:</span> {ban.bannableChamp}</div>
      </div>
    </div>
  ) : null;
}