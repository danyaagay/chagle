import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ChatsContext from '../contexts/ChatsContext';
import MobileTitleContext from '../contexts/MobileTitleContext';

const ChatsList = ({ setOpened }: { opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { chats, active } = useContext(ChatsContext);
	const { setMobileTitle } = useContext(MobileTitleContext);
	const navigate = useNavigate();
  
	return (
	  <div className="items-list">
			{chats && chats.map((chat: any) => (
				<Chat
					key={chat.id}
					chatId={chat.id}
					title={chat.title}
					active={active == chat.id ? true : false}
					onClick={() => {
						setOpened((o) => !o);
						setMobileTitle(chat.title);
						navigate('chat/'+chat.id);
					}}
				/>
			))}
	  </div>
	);
};

export default ChatsList;