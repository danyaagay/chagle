import { createContext, useEffect, useReducer, ReactNode, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError, AxiosResponse } from 'axios';

type Chat = {
	id: string;
	title: string;
};

type ChatsContextProps = {
	chats: Chat[] | null;
	dispatchChats: React.Dispatch<Action>;
	active: string | undefined;
	setActive: React.Dispatch<React.SetStateAction<string | undefined>>,
};

const ChatsContext = createContext<ChatsContextProps>({
	chats: null,
	dispatchChats: () => { },
	active: undefined,
	setActive: () => { },
});

type ChatsProviderProps = {
	children: ReactNode;
};

function ChatsProvider(props: ChatsProviderProps) {
	const [chats, dispatchChats] = useReducer(chatsReducer, []);
	const [active, setActive] = useState<string | undefined>(undefined);
	const location = useLocation();
	const { id } = useParams();

	useEffect(() => {
		// Get all chats
		(async () => {
			try {
				const resp: AxiosResponse<{ chats: Chat[] }> = await axios.get('/chats');
				console.log(resp);
				if (resp.status === 200) {
					dispatchChats({ type: 'set', chats: resp.data.chats });
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					console.log(error);
				}
			}
		})();

		return () => {
			setActive(undefined);
			dispatchChats({ type: 'set', chats: null });
		}
	}, []);


	useEffect(() => {
		setActive(id);
	}, [location]);

	return (
		<ChatsContext.Provider value={{ chats, dispatchChats, active, setActive }}>
			{props.children}
		</ChatsContext.Provider>
	);
}

type Action =
	| { type: 'set', chats: Chat[] | null }
	| { type: 'add', id: string, title: string }
	| { type: 'change', chat: Chat }
	| { type: 'delete', id: string };

function chatsReducer(chats: Chat[], action: Action): Chat[] {
	switch (action.type) {
		case 'set':
			return action.chats || [];
		case 'add':
			return [...chats, {
				id: action.id,
				title: action.title
			}];
		case 'change':
			return chats.map(chat => {
				if (chat.id === action.chat.id) {
					return action.chat;
				} else {
					return chat;
				}
			});
		case 'delete':
			return chats.filter(chat => chat.id !== action.id);
		default:
			const { type } = action as never;
			throw new Error('Unknown action: ' + type);
	}
}

export default ChatsContext;
export { ChatsProvider };
