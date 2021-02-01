```typescript
  const handleOutsideClick = (e: any) => {
    if (
      skinSelectorRef &&
      !(skinSelectorRef?.current as any)?.contains(e.target) &&
      addSkinSelectorRef &&
      !(addSkinSelectorRef?.current as any)?.contains(e.target) &&
      chromaSelectorRef &&
      !(chromaSelectorRef?.current as any)?.contains(e.target) &&
      addChromaSelectorRef &&
      !(addChromaSelectorRef?.current as any)?.contains(e.target) &&
      addRandomChromaSelectorRef &&
      !(addRandomChromaSelectorRef?.current as any)?.contains(e.target)
    ) {
      setSkinSelectorOpen(false);
      setAddSkinSelectorOpen(false);
      setChromaSelectorOpen(false);
      setAddChromaSelectorOpen(false);
    }
  };

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
```