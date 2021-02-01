import React, { useEffect, useRef, useState } from 'react';

import { Checkbox } from './Checkbox';
import { RoleMapping } from './persistence/persistence';

import './Checkbox.css';

interface Props {
  roles: RoleMapping[];
  onChange: (value: string) => void;
}

interface MappedRoles {
  key: number;
  selected: boolean;
  value: string;
}

export function Checkboxes(props: Props) {
  const [roles, setRoles] = useState<MappedRoles[]>([]);
  const selectedRoles = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const mappedRoles: MappedRoles[] = [];
    props.roles.map((role, i) => {
      const selected = selectedRoles.current[role.value] || true;
      selectedRoles.current[role.value] = selected;
      mappedRoles.push({ key: i, value: role.value, selected });
    });
    setRoles(mappedRoles);
  }, [props.roles]);

  const toggleRoleDeselection = (value: string) => {
    const mappedRoles: MappedRoles[] = [...roles];
    mappedRoles.map(role => {
      if (role.value === value) {
        role.selected = !role.selected;
      }
      return role;
    });
    selectedRoles.current[value] = !selectedRoles.current[value] || true;
    setRoles(mappedRoles);
    props.onChange(value);
  };

  return (
    <>
      {roles.map((role, i) => {
        if (role.value && role.value.length) {
          return (
            <Checkbox id={i} role={role.value} selected={role.selected} onDeselect={() => toggleRoleDeselection(role.value)}/>
          )
        }
      })}
    </>
  )
}