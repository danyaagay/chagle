import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import ChatsContext from '../contexts/ChatsContext';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

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
	const { setActive } = useContext(ChatsContext);
	const [mobileTitle, setMobileTitle] = useState<string | false>(false);
	const [opened, { toggle }] = useDisclosure(false);
	const { id } = useParams();

	const { data: chats } = useQuery({
		queryKey: ['chats'],
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	});

	// Set mobile title when loading page first time
	useEffect(() => {
		const path = window.location.pathname;
		if (path === '/settings') {
			setMobileTitle('Настройки');
			document.title = 'Настройки';
		} else if (path === '/chat') {
			setMobileTitle('Новый чат');
			document.title = 'Новый чат';
		} else if (path === '/Crr183gJkwKQwkC3jE9N') {
			setMobileTitle('Админ панель');
			document.title = 'Админ панель';
		} else if (path === '/Crr183gJkwKQwkC3jE9N/users') {
			setMobileTitle('Админ панель');
			document.title = 'Админ панель';
		} else if (path === '/Crr183gJkwKQwkC3jE9N/users') {
			setMobileTitle('Клиенты');
			document.title = 'Админ панель';
		} else if (path === '/Crr183gJkwKQwkC3jE9N/tokens') {
			setMobileTitle('Токены');
			document.title = 'Токены';
		} else if (Array.isArray(chats) && id) {
			const chat = chats.find((chat: any) => chat.id == id);
			if (chat) {
				setMobileTitle(chat.title);
				document.title = chat.title;
				setActive(id);
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