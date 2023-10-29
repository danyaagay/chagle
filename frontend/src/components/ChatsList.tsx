import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { Scrollbars } from 'react-custom-scrollbars-2';
import classes from '../css/ProtectedLayout.module.css';
import { useMediaQuery } from '@mantine/hooks';

const ChatsList = () => {
	const { chats, active, setActive } = useContext(ChatsContext);
	const { setMobileTitle } = useContext(MobileHeaderContext);
	const navigate = useNavigate();
	const mobileScreen = useMediaQuery('(max-width: 767px)');
  
	return (
		<Scrollbars autoHide>
			{chats && chats.map((chat: any) => (
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