import { createContext } from 'react';

type Dialog = {
  id: string;
  title: string;
};

const DialogsContext = createContext<{
  dialogs: Dialog[] | null;
  setDialogs: (newDialogs: Dialog[] | null) => void;
}>({
  dialogs: null,
  setDialogs: () => {},
});

export default DialogsContext;