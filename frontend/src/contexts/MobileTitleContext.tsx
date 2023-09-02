import { createContext } from 'react';

const MobileTitleContext = createContext<{
  mobileTitle: string | false;
  setMobileTitle: (newTitle: string) => void;
}>({
  mobileTitle: false,
  setMobileTitle: () => {},
});

export default MobileTitleContext;