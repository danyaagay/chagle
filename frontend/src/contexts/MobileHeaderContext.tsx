import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import ChatsContext from '../contexts/ChatsContext';
import { useDisclosure } from '@mantine/hooks';

const MobileHeaderContext = createContext<{
	mobileTitle: string | false;
	setMobileTitle: (title: string) => void;
	opened: boolean;
	toggle: () => void;
}>({
	mobileTitle: false,
	setMobileTitle: () => { },
	opened: false,
	toggle: () => { },
});

type MobileHeaderProviderProps = {
	children: ReactNode;
};

function MobileHeaderProvider(props: MobileHeaderProviderProps) {
	const { chats, active } = useContext(ChatsContext);
	const [mobileTitle, setMobileTitle] = useState<string | false>(false);
	const [opened, { toggle }] = useDisclosure(false);

	// Set mobile title when loading page first time
	useEffect(() => {
		const path = window.location.pathname;
		if (path === '/settings') {
			setMobileTitle('Настройки');
		} else if (path === '/chat') {
			setMobileTitle('Новый чат');
		} else if (path === '/Crr183gJkwKQwkC3jE9N') {
			setMobileTitle('Админ панель');
		} else if (path === '/Crr183gJkwKQwkC3jE9N/users') {
			setMobileTitle('Админ панель');
		} else if (path === '/Crr183gJkwKQwkC3jE9N/users') {
			setMobileTitle('Клиенты');
		} else if (path === '/Crr183gJkwKQwkC3jE9N/tokens') {
			setMobileTitle('Токены');
		} else if (chats && active) {
			const chat = chats.find(chat => chat.id == active);
			if (chat) {
				setMobileTitle(chat.title);
			}
		}
	}, [chats]);

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