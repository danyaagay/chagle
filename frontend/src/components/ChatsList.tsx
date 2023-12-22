import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { Scrollbars } from 'react-custom-scrollbars';
import axios from '../axios';
import { useQuery } from '@tanstack/react-query';

const ChatsList = () => {
	const { active, setActive } = useContext(ChatsContext);
	const { setMobileTitle, opened, toggle } = useContext(MobileHeaderContext);
	const navigate = useNavigate();

	const { data: chats } = useQuery({
		queryKey: ['chats'],
		queryFn: () =>
			axios.get('/chats').then(
				(res) => res.data.chats,
			),
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	});

	return (
		<Scrollbars autoHide>
			{chats?.map((chat: any) => (
				<Chat
					key={chat.id}
					chatId={chat.id}
					title={chat.title}
					active={active == chat.id ? true : false}
					onClick={() => {
						setMobileTitle(chat.title);
						document.title = chat.title;
						setActive(chat.id);
						navigate('chat/' + chat.id);
						if (opened) {
							toggle();
						}
						//setOpened((o) => !o);
					}}
				/>
			))}
		</Scrollbars>
	);
};

export default ChatsList;