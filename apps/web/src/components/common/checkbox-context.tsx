import { createContext, useContext } from 'react';

type CheckboxContextValue = {
  enabled: boolean;
};

export const CheckboxContext = createContext<CheckboxContextValue | null>(null);
export const useCheckboxContext = () => useContext(CheckboxContext);
