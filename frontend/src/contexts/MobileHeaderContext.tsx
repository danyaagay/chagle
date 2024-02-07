import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import ChatsContext from '../contexts/ChatsContext';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { IS_MOBILE } from '../environment/userAgent';

const MobileHeaderContext = createContext<{
	mobileTitle: string | false;
	setMobileTitle: (title: string) => void;
	opened: boolean;
	toggle: () => void;
	openedSettings: boolean | undefined;
	toggleSettings: () => void;
}>({
	mobileTitle: false,
	setMobileTitle: () => { },
	opened: false,
	toggle: () => { },
	openedSettings: undefined,
	toggleSettings: () => { },
});

type MobileHeaderProviderProps = {
	children: ReactNode;
};

function MobileHeaderProvider(props: MobileHeaderProviderProps) {
	const { setActive } = useContext(ChatsContext);
	const [mobileTitle, setMobileTitle] = useState<string | false>(false);
	const [opened, { toggle }] = useDisclosure(false);
	const { id } = useParams();
	const navigate = useNavigate();

	const [openedSettings, setOpenedSettings] = useState<boolean | undefined>(undefined);
	useEffect(() => {
		const storedValue = localStorage.getItem('openedSettings');
		if (!IS_MOBILE && storedValue) {
			setOpenedSettings(JSON.parse(storedValue));
		}
	}, []);
	useEffect(() => {
		if (!IS_MOBILE && openedSettings !== undefined) {
			localStorage.setItem('openedSettings', JSON.stringify(openedSettings));
		}
	}, [openedSettings]);
	const toggleSettings = () => {
		setOpenedSettings(!openedSettings);
	};

	const { data: chats } = useQuery({
		queryKey: ['chats'],
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	});

	// Set mobile title when loading page first time
	useEffect(() => {
		const path = window.location.pathname;
		let title = '';


		switch (path) {
			case '/settings':
				title = 'Настройки';
				break;
			case '/chat':
				title = 'Новый чат';
				break;
			case '/Crr183gJkwKQwkC3jE9N':
				title = 'Админ панель';
				break;
			case '/Crr183gJkwKQwkC3jE9N/users':
				title = 'Клиенты';
				break;
			case '/Crr183gJkwKQwkC3jE9N/tokens':
				title = 'Токены';
				break;
			case '/Crr183gJkwKQwkC3jE9N/proxy':
				title = 'Прокси';
				break;
			case '/billing':
				title = 'Оплата';
				break;
			case '/tool':
				title = 'Инструменты';
				break;
			case '/tool/improve':
				title = 'Улучшить';
				break;
			case '/tool/grammar':
				title = 'Орфография';
				break;
			default:
				if (Array.isArray(chats) && id) {
					const chat = chats.find((chat: any) => chat.id == id);
					if (chat) {
						title = chat.title;
						setActive(id);
					} else {
						title = 'Новый чат';
						navigate('/chat');
					}
				}
				break;
		}

		setMobileTitle(title);
		document.title = title;
	}, [chats]);

	return (
		<MobileHeaderContext.Provider value={{ mobileTitle, setMobileTitle, opened, toggle, openedSettings, toggleSettings }}>
			{props.children}
		</MobileHeaderContext.Provider>
	);
}

function useMobileHeader() {
	return useContext(MobileHeaderContext);
}

export default MobileHeaderContext;
export { MobileHeaderProvider, useMobileHeader };