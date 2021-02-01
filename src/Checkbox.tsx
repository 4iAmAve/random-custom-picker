import React from 'react';

interface Props {
  key: number;
  role: string;
  selected: boolean;
  onDeselect: () => void;
}

export function Checkbox(props: Props) {
  const { key, role, selected, onDeselect } = props;
  return (
    <label key={`role-checkbox-${key}`} className="pure-material-checkbox">
      <input type="checkbox" checked={selected} onChange={() => {}}/>
      <span onClick={onDeselect}>{role}</span>
    </label>
  );
}
