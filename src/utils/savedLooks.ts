const STORAGE_KEY = 'viraas_saved_looks';

export const getSavedLooks = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLook = (id: string) => {
  const saved = getSavedLooks();
  if (!saved.includes(id)) {
    saved.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
};

export const removeLook = (id: string) => {
  const saved = getSavedLooks().filter(s => s !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
};

export const isLookSaved = (id: string): boolean => {
  return getSavedLooks().includes(id);
};

export const toggleSavedLook = (id: string): boolean => {
  if (isLookSaved(id)) {
    removeLook(id);
    return false;
  } else {
    saveLook(id);
    return true;
  }
};
