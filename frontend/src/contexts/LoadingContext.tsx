import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
	//const { chats } = useContext(ChatsContext);
	const { mobileTitle } = useContext(MobileHeaderContext);
	const [ loading, setLoading ] = useState<boolean>(true);
	const { id } = useParams();

	const queryClient = useQueryClient();

	const pendingChats = queryClient.getQueryData(['chats']);
	const pendingMessages = queryClient.getQueryData(['messages', id]);


	// Loading status
	useEffect(() => {
		const path = window.location.pathname;
		const page = path.split('/')[1];

		if (pendingChats && mobileTitle) {
			if (page === 'chats') {
				if (id) {
					//if (pendingMessages) {
						setLoading(false);
					//}
				} else {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		}
	}, [pendingChats, pendingMessages, mobileTitle]);

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