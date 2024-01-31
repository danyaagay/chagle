import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { Scrollbars } from 'react-custom-scrollbars';
import axios from '../axios';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { produce } from 'immer';

const ChatsList = () => {
	const { active, setActive } = useContext(ChatsContext);
	const { setMobileTitle, opened, toggle } = useContext(MobileHeaderContext);
	const navigate = useNavigate();

	const dateStamping = (chats: any[]): any[] => {
		return produce(chats, (draft: any[]) => {
			draft.forEach((chat: any) => {
				const now = dayjs(); // текущая дата и время
				const updatedDate = dayjs(chat.updated_at); // дата и время обновления

				if (now.diff(updatedDate, 'day') < 1) {
					// Если прошло менее суток, показываем время
					chat.date = updatedDate.format('HH:mm');
				} else if (now.diff(updatedDate, 'week') > 1) {
					// Если прошло больше недели, показываем дату
					chat.date = updatedDate.format('DD.MM.YYYY');
				} else {
					// Если прошло меньше недели, не изменяем chat.date
					chat.date = dayjs().locale("ru").format("dd");
				}
			});
		});
	};

	const sorting = (chats: any[]): any[] => {
		return chats.sort((a, b) => (dayjs(a.updated_at).isBefore(dayjs(b.updated_at)) ? 1 : -1));
	};

	const { data: chats } = useQuery({
		queryKey: ['chats'],
		queryFn: () =>
			axios.get('/chats').then((res) => dateStamping(res.data.chats)),
		staleTime: Infinity,
		gcTime: Infinity,
		select: (data) => (sorting([...data])),
		refetchOnWindowFocus: false,
	});

	return (
		<Scrollbars autoHide>
			{chats?.map((chat: any) => (
				<Chat
					key={chat.id}
					chatId={chat.id}
					title={chat.title}
					sub_title={chat.sub_title}
					date={chat.date}
					active={active == chat.id ? true : false}
					onClick={() => {
						setMobileTitle(chat.title);
						document.title = chat.title;
						setActive(chat.id);
						navigate('chat/' + chat.id);
						if (opened) {
							toggle();
						}
					}}
				/>
			))}
		</Scrollbars>
	);
};

export default ChatsList;