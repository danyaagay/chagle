import Chat from './Chat';
import { Scrollbars } from 'react-custom-scrollbars';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { produce } from 'immer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from '../axios';
import { useInView } from 'react-intersection-observer';

const ChatsList = () => {
	const { ref, inView } = useInView();

	let allItems: any;

	const {
		data,
		fetchNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ['chats'],
		queryFn: async ({ pageParam }) => {
			const res = await axios.get('/chats?offset=' + pageParam)
			return dateStamping(res.data);
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage: any, _allPages: any) => {
            if (lastPage.hasMore === false) {
                return undefined;
            }
            return allItems ? allItems.length : 20;
        },
		staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
	})

	useEffect(() => {
		if (inView) {
			fetchNextPage()
		}
	}, [fetchNextPage, inView])

	const dateStamping = (chats: any): any => {
		return produce(chats, (draft: any) => {
			draft.chats.forEach((chat: any) => {
				const now = dayjs(); // текущая дата и время
				const updatedDate = dayjs(chat.used_at); // дата и время обновления

				const isNewDay = now.isAfter(updatedDate, 'day');

				if (isNewDay) {
					if (now.diff(updatedDate, 'week') > 1) {
						// Если прошло больше недели, показываем дату
						chat.date = updatedDate.format('DD.MM.YYYY');
					} else {
						// Если прошло меньше недели, не изменяем chat.date
						chat.date = dayjs().locale("ru").format("dd");
					}
				} else {
					chat.date = updatedDate.format('HH:mm');
				}
			});
		});
	};

	const sorting = (chats: any[]): any[] => {
		return chats?.sort((a, b) => (dayjs(a.used_at).isBefore(dayjs(b.used_at)) ? 1 : -1));
	};

	allItems = data?.pages?.flatMap((page: any) => page.chats);
	const sortedItems = sorting(allItems);

	return (
		<Scrollbars autoHide>
			{sortedItems?.map((chat: any) => (
				<Chat
					key={chat.id}
					chatId={chat.id}
					title={chat.title}
					sub_title={chat.sub_title}
					date={chat.date}
				/>
			))}

			{hasNextPage && <div ref={ref} style={{width: '100%', height: 20}}></div>}
		</Scrollbars>
	);
};

export default ChatsList;