import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const MobileTitleContext = createContext<{
  mobileTitle: string | false;
  setMobileTitle: (title: string) => void;
}>({
  mobileTitle: false,
  setMobileTitle: () => {},
});

type MobileTitleProviderProps = {
	children: ReactNode;
};

function MobileTitleProvider(props: MobileTitleProviderProps) {
	const [ mobileTitle, setMobileTitle ] = useState<string | false>(false);

	useEffect(() => {
		// Set mobile title when loading page first time
		const path = window.location.pathname;
		if (path === '/settings') {
			setMobileTitle('Настройки');
		} else if (path === '/chat') {
			setMobileTitle('Новый чат');
		} else {
			setMobileTitle(false);
		}
	}, [setMobileTitle]);

	return (
		<MobileTitleContext.Provider value={{ mobileTitle, setMobileTitle }}>
			{props.children}
		</MobileTitleContext.Provider>
	);
}

function useMobileTitle() {
	return useContext(MobileTitleContext);
}

export default MobileTitleContext;
export { MobileTitleProvider, useMobileTitle };