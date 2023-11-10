import { useContext, useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import useStateRef from 'react-usestateref'
import { IS_OVERLAY_SCROLL_SUPPORTED } from '../environment/overlayScrollSupport';
import { ChatFeed } from 'react-bell-chat'


const InfiniteBox5 = () => {
	const { id } = useParams();
	const scrollRef = useRef<any>();
	const state = useRef<any>({ messages: [] });

	const [{ authors, messages, messageText }, setState] =
		useState<any>({
			messages: [
				{
					id: 1,
					authorId: 1,
					message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
				},
				{
					id: 2,
					authorId: 1,
					message: 'Rly is.',
				},
				{
					id: 3,
					authorId: 1,
					message: 'Long group.',
				},
				{
					id: 4,
					authorId: 0,
					message: 'My message.',
				},
				{
					id: 5,
					authorId: 0,
					message: 'One more.',
				},
				{
					id: 6,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
				{
					id: 7,
					authorId: 1,
					message: 'I said group.',
				},
				{
					id: 8,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
				{
					id: 9,
					authorId: 1,
					message: 'I said group.',
				},
				{
					id: 10,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
				{
					id: 11,
					authorId: 1,
					message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
				},
				{
					id: 12,
					authorId: 1,
					message: 'Rly is.',
				},
				{
					id: 13,
					authorId: 1,
					message: 'Long group.',
				},
				{
					id: 14,
					authorId: 0,
					message: 'My message.',
				},
				{
					id: 15,
					authorId: 0,
					message: 'One more.',
				},
				{
					id: 16,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
				{
					id: 17,
					authorId: 1,
					message: 'I said group.',
				},
				{
					id: 18,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
				{
					id: 19,
					authorId: 1,
					message: 'I said group.',
				},
				{
					id: 20,
					authorId: 1,
					message: 'One more group to see the scroll.',
				},
			],
			messageText: '',
		});

	const onLoadOldMessages = useCallback(
		() => {
			new Promise<void>((resolve) =>
				setTimeout(() => {
					setState((previousState) => ({
						...previousState,
						messages: new Array(10)
							.fill(1)
							.map(
								(e, i) =>
								({
									id: Math.random(),
									message: 'Old message ' + (i + 1).toString(),
									authorId: Math.round(Math.random()),
								})
							)
							.concat(previousState.messages),
					}));

					console.log('content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
					//scrollRef.current.scrollTop = scrollSaver.current.last + ;
					loading.current = false;

					resolve();
				}, 1000)
			)
		},
		[]
	);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	useLayoutEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	useLayoutEffect(() => {
		console.log('updated content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
		scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + scrollSaver.current.last;
	}, [messages]);

	const scrollSaver = useRef<any>({ last: 99999, lastHeight: 0 });
	const loading = useRef<any>();
	const scroll = () => {
		if (scrollRef.current) {
			//if (scrollRef.current.scrollTop === 0) {
			//	scrollRef.current.scrollTop = 1;
			//}
			//console.log(scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
			if (scrollRef.current.scrollTop <= 300 && !loading.current && scrollRef.current.scrollTop < scrollSaver.current.last) {
				console.log('load new messages', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
				loading.current = true;
				onLoadOldMessages();
			}
			scrollSaver.current.last = scrollRef.current.scrollTop;
			scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
		}
	}

	return (
		<div
			className='scrollable scrollable-y'
			style={{
				height: '100%',
				overflow: 'auto',
			}}
			onScroll={scroll}
			ref={scrollRef}
		>
			{messages && messages.map((message) => (
				<Message
					key={message.id}
					text={message.message}
					marker={message.marker}
					you={message.authorId === 1 ? true : false}
					time={'false'}
				/>
			))}
		</div>
	);
};

export default InfiniteBox5;