import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useDisclosure } from '@mantine/hooks';

const MobileHeaderContext = createContext<{
	mobileTitle: string | false;
	setMobileTitle: (title: string) => void;
	opened: boolean;
	toggle: () => void;
}>({
	mobileTitle: false,
	setMobileTitle: () => {},
	opened: false,
	toggle: () => {},
});

type MobileHeaderProviderProps = {
	children: ReactNode;
};

function MobileHeaderProvider(props: MobileHeaderProviderProps) {
	const [mobileTitle, setMobileTitle] = useState<string | false>(false);
	const [opened, { toggle }] = useDisclosure(false);

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
		<MobileHeaderContext.Provider value={{ mobileTitle, setMobileTitle, opened, toggle }}>
			{props.children}
		</MobileHeaderContext.Provider>
	);
}

function useMobileHeader() {
	return useContext(MobileHeaderContext);
}

export default MobileHeaderContext;
export { MobileHeaderProvider, useMobileHeader };