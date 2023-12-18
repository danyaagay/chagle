import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';

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

	const pendingChats = useIsFetching({ queryKey: ['chats'] });
	const pendingMessages = useIsFetching({ queryKey: ['messages', id] });


	// Loading status
	useEffect(() => {
		const path = window.location.pathname;
		const page = path.split('/')[1];

		if (pendingChats === 0 && mobileTitle) {
			if (page === 'chats') {
				if (id) {
					if (pendingMessages === 0) {
						setLoading(false);
					}
				} else {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		}
		console.log('chats', pendingChats);
		console.log('messages', pendingMessages);
		console.log(loading, id, mobileTitle);
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