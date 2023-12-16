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
	const { setMobileTitle } = useContext(MobileHeaderContext);
	const navigate = useNavigate();

	const { data: chats } = useQuery({
		queryKey: ['chats'],
		queryFn: () =>
			axios.get('/chats').then(
				(res) => res.data.chats,
			),
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
						setActive(chat.id);
						setMobileTitle(chat.title);
						navigate('chat/'+chat.id);
						//setOpened((o) => !o);
					}}
				/>
			))}
	  </Scrollbars>
	);
};

export default ChatsList;