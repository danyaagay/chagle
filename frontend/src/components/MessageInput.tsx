import { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	IconReload,
	IconPlayerStop
} from '@tabler/icons-react';
import {
	Textarea,
	ActionIcon,
	Card,
	Tooltip,
} from '@mantine/core';
import { AxiosError } from 'axios';
import ChatsContext from '../contexts/ChatsContext';
import { IS_MOBILE } from '../environment/userAgent';
import classes from '../css/MessageInput.module.css';
import {
	useQuery,
	useQueryClient
} from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { produce } from 'immer';
import { useAuth } from '../contexts/AuthContext';
import MobileTitleContext from '../contexts/MobileHeaderContext';
//import ModelChangeButton from './ModelChangeButton';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ru';
dayjs.extend(utc);

export default function MessageInput({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) {
	const [isLoading, setIsLoading] = useState(false);
	const { setActive } = useContext(ChatsContext);
	const tempIdRef = useRef('');
	const [keyboardOpen, setKeyboardOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { id } = useParams();

	const { setMobileTitle } = useContext(MobileTitleContext);

	const { user } = useAuth();

	const queryClient = useQueryClient();

	useEffect(() => {
		const handleResize = () => {
			const VIEWPORT_VS_CLIENT_HEIGHT_RATIO = 0.75;
			const { visualViewport, screen } = window;

			if (visualViewport && (visualViewport.height * visualViewport.scale) / screen.height < VIEWPORT_VS_CLIENT_HEIGHT_RATIO) {
				setKeyboardOpen(true);
				//console.log('keyboard is shown');
			} else {
				setKeyboardOpen(false);
				//console.log('keyboard is hidden');
			}
		};

		if ('visualViewport' in window && window.visualViewport && IS_MOBILE) {
			window.visualViewport.addEventListener('resize', handleResize);
		}

		//если в чате прогружается сообщение и человек переключил, закончить прогрузку
		if (isLoading) {
			//delete tempRef.current[idRef.current];
			console.log('location change', tempIdRef.current, id);
			handleStop();
		}

		tempIdRef.current = '';
	}, [location]);

	// Handle send message
	const handleSend = async () => {
		if (!isLoading && textareaRef.current) {
			try {
				setIsLoading(true);

				const text = textareaRef.current.value;

				textareaRef.current.value = '';

				if (keyboardOpen || !IS_MOBILE) {
					textareaRef.current.focus();
				}

				queryClient.setQueryData(['messages', id ? 'temp' + id : 'temp'],
					(oldData: any) => {
						const date = new Date();
						const dateFormatted = date.toISOString();

						const timeString = dateFormatted.split('T')[1].slice(0, 5);
						let [hours, minutes] = timeString.split(':');
						hours = parseInt(hours).toString();

						if (oldData) {
							//console.log(oldData);
							return produce(oldData, (draft: any) => {
								draft.pages[0].messages.push({
									id: -1,
									text: text,
									you: true,
									date: dateFormatted,
									is_error: false,
									time: `${hours}:${minutes}`,
								});

								draft.pages[0].messages.push({
									id: -2,
									text: '...',
									you: false,
									date: dateFormatted,
									is_error: false,
									time: `${hours}:${minutes}`,
								});
							});
						} else {
							oldData = {
								pages: [
									{
										messages: [
											{
												id: -1,
												text: text,
												you: true,
												date: dateFormatted,
												is_error: false,
												time: `${hours}:${minutes}`,
											},
											{
												id: -2,
												text: '...',
												you: false,
												date: dateFormatted,
												is_error: false,
												time: `${hours}:${minutes}`,
											}
										],
										hasMore: false
									}
								],
								pageParams: [
									0
								]
							};
						}
						return oldData;
					}
				);

				const requestBody = { text };

				const url = import.meta.env.MODE == 'development' ? "http://192.168.0.116:8000/messages/" + (id ? id : '') : "https://api.chagle.ru/messages/" + (id ? id : '');

				try {
					const response = await fetch(url, {
						method: "POST",
						body: JSON.stringify(requestBody),
						headers: {
							'Content-Type': 'application/json'
						},
						credentials: "include",
					});

					if (!response.body) {
						console.error("ReadableStream not supported");
						return;
					}

					// Read the response as a stream of data
					const reader = response.body.getReader();
					const decoder = new TextDecoder("utf-8");

					let answer = '';

					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							break;
						}
						// Massage and parse the chunk of data
						const chunk = decoder.decode(value);

						//console.log(chunk);

						const lines = chunk.split("\n\n");

						//console.log(lines);

						const parsedLines = lines
							.map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
							.filter((line) => line !== "" && line !== "ping") // Remove empty lines and "[DONE]"
							.map((line) => JSON.parse(line)); // Parse the JSON string

						//console.log(parsedLines);

						for (const parsedLine of parsedLines) {
							//console.log(parsedLine);
							const { message, answerId, messageId, chatId, tempId, amount, error } = parsedLine;

							//console.log(answer, message);

							//console.log(answerId, messageId);
							// Update the UI with the new content
							if (message) {
								answer += message;

								queryClient.setQueryData(['messages', id ? 'temp' + id : 'temp'],
									(oldData: any) => {
										if (oldData) {
											return produce(oldData, (draft: any) => {
												draft.pages[0].messages.forEach((message: any) => {
													if (message.id === -2) {
														message.is_error = error ? error : false;
														message.text = answer;
													}
												});
											});
										}
										return oldData;
									}
								);
							} else if (amount) {
								user.balance = amount;
							} else if (tempId) {
								tempIdRef.current = tempId;
							} else if (messageId) {
								queryClient.setQueryData(['messages', id ? 'temp' + id : 'temp'],
									(oldData: any) => {
										if (oldData) {
											return produce(oldData, (draft: any) => {
												draft.pages[0].messages.forEach((message: any) => {
													if (message.id === -1) {
														message.id = messageId;
													}
												});
											});
										}
										return oldData;
									}
								);
								//console.log('change message');
							} else if (answerId) {
								queryClient.setQueryData(['messages', id ? 'temp' + id : 'temp'],
									(oldData: any) => {
										if (oldData) {
											return produce(oldData, (draft: any) => {
												draft.pages[0].messages.forEach((message: any) => {
													if (message.id === -2) {
														message.id = answerId;
													}
												});
											});
										}
										return oldData;
									}
								);
								//console.log('change answer');
							} else if (chatId) {
								const now = dayjs();

								queryClient.setQueryData(['chats'],
									(oldData: any) => {
										return produce(oldData, (draft: any) => {
											draft.pages[0].chats.unshift({
												title: text,
												sub_title: answer,
												id: chatId,
												date: now.format('HH:mm'),
												used_at: now.utc(),
												model: 'gpt-3.5-turbo',
												system_message: '',
												max_tokens: '2048',
												history: '1',
											});
										});
									}
								);

								if (tempIdRef.current) {
									setActive(chatId);
									navigate('/chat/' + chatId);
									setMobileTitle(text);
								} else {
									const tempData = queryClient.getQueryData(['messages', 'temp']);
									queryClient.setQueryData(['messages', chatId], tempData);
									queryClient.setQueryData(['messages', 'temp'], {
										pages: [
											{
												messages: [

												],
												hasMore: false
											}
										],
										pageParams: [
											0
										]
									});
								}
							}
						}
					}

					queryClient.setQueryData(['chats'],
						(oldData: any) => {
							if (oldData) {
								return produce(oldData, (draft: any) => {
									draft.pages[0].chats.forEach((chat: any) => {
										if (chat.id == id) {
											const now = dayjs();
											chat.date = now.format('HH:mm');
											chat.used_at = now.utc();
											chat.sub_title = answer;
										}
									});
								});
							}
							return oldData;
						}
					);
				} catch (error) {
					console.error(error);
				}

				setIsLoading(false);
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					// Delete error
				}
			}
		}
	};

	const handleRegenerate = async () => {
		if (!isLoading) {
			try {
				setIsLoading(true);

				const hasTemp = queryClient.getQueryData(['messages', 'temp' + id]);

				let oldMessage: any;

				queryClient.setQueryData(['messages', hasTemp ? 'temp' + id : id],
					(oldData: any) => {
						if (oldData) {
							oldMessage = oldData.pages[0].messages.slice(-1)[0];
							return produce(oldData, (draft: any) => {
								draft.pages[0].messages.pop();
							});
						}
						return oldData;
					}
				);

				queryClient.setQueryData(['messages', 'temp' + id],
					(oldData: any) => {
						if (oldData) {
							return produce(oldData, (draft: any) => {
								draft.pages[0].messages.push({
									...oldMessage,
									text: '...'
								});
							});
						} else {
							oldData = {
								pages: [
									{
										messages: [
											{
												...oldMessage,
												text: '...'
											},
										],
										hasMore: false
									}
								],
								pageParams: [
									0
								]
							};
						}
						return oldData;
					}
				);

				const url = import.meta.env.MODE == 'development' ? "http://192.168.0.116:8000/messages/regenerate/" + id : "https://api.chagle.ru/messages/regenerate/" + id;

				try {
					const response = await fetch(url, {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						credentials: "include",
					});

					if (!response.body) {
						console.error("ReadableStream not supported");
						return;
					}

					// Read the response as a stream of data
					const reader = response.body.getReader();
					const decoder = new TextDecoder("utf-8");

					let answer = '';

					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							break;
						}
						// Massage and parse the chunk of data
						const chunk = decoder.decode(value);

						//console.log(chunk);

						const lines = chunk.split("\n\n");

						//console.log(lines);

						const parsedLines = lines
							.map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
							.filter((line) => line !== "" && line !== "ping") // Remove empty lines and "[DONE]"
							.map((line) => JSON.parse(line)); // Parse the JSON string

						//console.log(parsedLines);

						for (const parsedLine of parsedLines) {
							//console.log(parsedLine);
							const { message, tempId, amount, error } = parsedLine;

							//console.log(answer, message);

							//console.log(answerId);
							// Update the UI with the new content
							if (message) {
								answer += message;

								//console.log(messageRegeneratedId, answer);

								queryClient.setQueryData(['messages', 'temp' + id],
									(oldData: any) => {
										if (oldData) {
											return produce(oldData, (draft: any) => {
												draft.pages[0].messages.forEach((message: any) => {
													if (message.id === oldMessage.id) {
														message.is_error = error ? error : false;
														message.text = answer;
													}
												});
											});
										}
										return oldData;
									}
								);
							} else if (amount) {
								user.balance = amount;
							} else if (tempId) {
								tempIdRef.current = tempId;
							}
						}
					}
					queryClient.setQueryData(['chats'],
						(oldData: any) => {
							if (oldData) {
								return produce(oldData, (draft: any) => {
									draft.pages[0].chats.forEach((chat: any) => {
										if (chat.id == id) {
											const now = dayjs();
											chat.date = now.format('HH:mm');
											chat.used_at = now.utc();
											chat.sub_title = answer;
										}
									});
								});
							}
							return oldData;
						}
					);
				} catch (error) {
					console.error(error);
				}

				setIsLoading(false);
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					// Delete error
				}
			}
		}
	}

	const handleStop = async () => {
		await fetch(import.meta.env.MODE == 'development' ? "http://192.168.0.116:8000/messages-cancel" : "https://api.chagle.ru/messages-cancel", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: "include",
			body: JSON.stringify({ id: tempIdRef.current })
		});
	};

	//WORKED without inner
	//queryClient.setQueryData(['messages', id],
	//	(data) => {
	//		return {
	//			...data,
	//			pages: data.pages.map((page) => ({
	//				...page,
	//				messages: page.messages.map((message) =>
	//					message.id === 72
	//						? { ...message, text: 'new name' }
	//						: message)
	//			})),
	//		}
	//	}
	//);



	//ВРЕМЕННО Начало (баг OpenRouter)
	const [isOpenRouter, setIsOpenRouter] = useState(false);

	const { data: chats }: any = useQuery({
		queryKey: ['chats'],
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		const allItems: any = chats?.pages?.flatMap((page: any) => page.chats);

		if (id && allItems && Array.isArray(allItems)) {
			const chat = allItems.find(chat => chat.id == id);
			console.log(chat)

			if (chat['model'] == 'openai/gpt-4' ||
				chat['model'] == 'openai/gpt-4-32k' ||
				chat['model'] == 'openai/gpt-4-turbo-preview') {
				setIsOpenRouter(true);
			}
		}
	}, [id, chats]);
	//ВРЕМЕННО Конец (баг OpenRouter)

	return (
		<div className='chatInput'>
			<div className='chatInputContainer'>
				{isLoading ? (
					isOpenRouter ?
						(<Tooltip
							multiline
							w={220}
							transitionProps={{ duration: 200 }}
							label="Отмена генерации на всех моделях кроме GPT 3.5 временно недоступна"
						>
							<ActionIcon
								variant="transparent"
								size="lg"
								className={classes.send}
							>
								<IconPlayerStop stroke={1.5} className={classes.linkIcon} />
							</ActionIcon>
						</Tooltip>)
						:
						(<ActionIcon
							variant="transparent"
							size="lg"
							className={classes.send}
							onClick={handleStop}
						>
							<IconPlayerStop stroke={1.5} className={classes.linkIcon} />
						</ActionIcon>)
				) : id && (
					<ActionIcon
						variant="transparent"
						size="lg"
						className={classes.send}
						onClick={handleRegenerate}
					>
						<IconReload stroke={1.5} className={classes.linkIcon} />
					</ActionIcon>
				)}

				<Card shadow="0" padding="0" radius="lg" withBorder style={{ width: '100%', flexDirection: 'row' }}>
					<div style={{ width: '100%' }}>
						<Textarea
							ref={textareaRef}
							placeholder="Сообщение"
							autosize
							minRows={1}
							maxRows={6}
							size="lg"
							classNames={{ input: classes.input, root: classes.root }}
							variant="unstyled"
						/>
					</div>
					<div style={{ display: 'flex' }}>

					</div>
				</Card>

				<ActionIcon
					onClick={handleSend}
					variant="transparent"
					size="lg"
					className={classes.send}
					id='send'
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width={24}
						height={24}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
						className={classes.linkIconSend}
					>
						<path d="M10 14l4 -4" />
						<path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
					</svg>
				</ActionIcon>

			</div>
		</div>
	);
}
