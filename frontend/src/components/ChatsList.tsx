import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { Scrollbars } from 'react-custom-scrollbars';

const ChatsList = () => {
	const { chats, active, setActive } = useContext(ChatsContext);
	const { setMobileTitle } = useContext(MobileHeaderContext);
	const navigate = useNavigate();
  
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