import React from 'react';

import './profileSuggestion.css';

interface Props {
  visible: boolean;
  profile: string | null;
  profiles: string[];
  onSelect: (profile: string) => void;
}

export const ProfileSuggestion = (props: Props) => {
  const handleProfileSelect = (profile: string) => console.log('test', profile);
  return (
    <div className={`profile-suggestion__container ${props.visible ? 'visible' : ''}`}>
      {props.profiles.map((p, i) => (
        <div
          key={`profile-sggestion-${i}`}
          className={`profile-suggestion__element ${p === props.profile ? 'selected' : ''}`}
          onClick={() => props.onSelect(p)}
        >
          {p}
        </div>
      ))}
    </div>
  )
}