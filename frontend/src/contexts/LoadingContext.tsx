import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import MessagesContext from '../contexts/MessagesContext';

const LoadingContext = createContext<{
	loading: boolean;
	setLoading: (loading: boolean) => void;
}>({
	loading: true,
	setLoading: () => { },
});

type LoadingProviderProps = {
	children: ReactNode;
};

function LoadingProvider(props: LoadingProviderProps) {
	const { chats } = useContext(ChatsContext);
	const { mobileTitle } = useContext(MobileHeaderContext);
	const { messages } = useContext(MessagesContext);
	const [loading, setLoading] = useState<boolean>(true);
	const { id } = useParams();

	// Loading status
	useEffect(() => {
		const path = window.location.pathname;

		//if (path === '/settings') {
		//	setMobileTitle('Настройки');
		//}
		console.log(chats, messages, mobileTitle);

		if (chats && chats.length > 0 && mobileTitle) {
			if (id) {
				if (messages && messages.length > 0) {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		}
	}, [chats, mobileTitle, messages]);

	return (
		<LoadingContext.Provider value={{ loading, setLoading }}>
			{props.children}
		</LoadingContext.Provider>
	);
}

function useLoading() {
	return useContext(LoadingContext);
}

export default LoadingContext;
export { LoadingProvider, useLoading };