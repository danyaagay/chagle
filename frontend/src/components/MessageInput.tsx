import { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
	IconReload,
	IconPlayerStop
} from '@tabler/icons-react';
import {
	Textarea,
	Group,
	ActionIcon,
	Card,
} from '@mantine/core';
import { AxiosError } from 'axios';
import ChatsContext from '../contexts/ChatsContext';
import MessagesContext from '../contexts/MessagesContext';
import { IS_MOBILE } from '../environment/userAgent';
import classes from '../css/MessageInput.module.css';

export default function MessageInput({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) {
	const [isLoading, setIsLoading] = useState(false);
	const { dispatchChats, active, setActive } = useContext(ChatsContext);
	const { dispatch, messages, tempRef, idRef } = useContext(MessagesContext);
	const tempIdRef = useRef('');
	const [keyboardOpen, setKeyboardOpen] = useState(false);
	const location = useLocation();

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

		//если в чате прогружается сообщение и человек переключил, закончить прогрузку и сбросить кеш
		if (isLoading) {
			delete tempRef.current[idRef.current];
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

				dispatch({
					type: 'add',
					message: {
						id: -1,
						text: text,
						you: true,
					}
				});

				dispatch({
					type: 'add',
					message: {
						id: -2,
						text: '...',
						you: false
					}
				});

				const requestBody = { text };

				const url = 'http://192.168.0.116:8000/api/messages/' + (active ? active : '');

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
							const { message, answerId, messageId, chatId, tempId, error } = parsedLine;

							//console.log(answer, message);

							//console.log(answerId, messageId);
							// Update the UI with the new content
							if (message) {
								answer += message;

								dispatch({
									type: 'change',
									id: -2,
									message: {
										is_error: error ? error : false,
										text: answer
									}
								});
							} else if (tempId) {
								tempIdRef.current = tempId;
							} else if (messageId) {
								dispatch({
									type: 'change',
									id: -2,
									message: {
										id: messageId,
									}
								});
								//console.log('change message');
							} else if (answerId) {
								dispatch({
									type: 'change',
									id: -1,
									message: {
										id: answerId,
									}
								});
								//console.log('change answer');
							} else if (chatId) {
								dispatchChats({
									type: 'add',
									title: text,
									id: chatId
								});

								if (tempIdRef.current) {
									setActive(chatId);
									window.history.replaceState(null, text, '/chat/' + chatId);
								}
							}
						}
					}
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

				let messageRegeneratedId;
				if (messages && messages.length > 0 && active) {
					messageRegeneratedId = messages[messages?.length - 1].id;
				} else {
					return false;
				}

				dispatch({
					type: 'change',
					id: messageRegeneratedId,
					message: {
						text: '...'
					}
				});

				const url = 'http://192.168.0.116:8000/api/messages/regenerate/' + active;

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
							const { message, tempId, error } = parsedLine;

							//console.log(answer, message);

							//console.log(answerId);
							// Update the UI with the new content
							if (message) {
								answer += message;

								console.log(messageRegeneratedId, answer);

								dispatch({
									type: 'change',
									id: messageRegeneratedId,
									message: {
										is_error: error ? error : false,
										text: answer
									}
								});
							} else if (tempId) {
								tempIdRef.current = tempId;
							}
						}
					}
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

	const handleStop = async () => {
		await fetch('http://192.168.0.116:8000/api/messages-cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: "include",
			body: JSON.stringify({ id: tempIdRef.current })
		});
		//abortController.abort();
	};

	return (
		<div className='chatInput'>
			<div className='chatInputContainer'>
				{isLoading ? (
					<ActionIcon
						variant="transparent"
						size="lg"
						className={classes.send}
						onClick={handleStop}
					>
						<IconPlayerStop stroke={1.5} className={classes.linkIcon} />
					</ActionIcon>
				) : (
					<ActionIcon
						variant="transparent"
						size="lg"
						className={classes.send}
						onClick={handleRegenerate}
					>
						<IconReload stroke={1.5} className={classes.linkIcon} />
					</ActionIcon>
				)}

				<Card shadow="0" padding="0" radius="lg" withBorder style={{ width: '100%' }}>
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
