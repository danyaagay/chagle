import { useContext, useState } from 'react';
import {
	IconSend
} from '@tabler/icons-react';
import {
	Textarea,
	Group,
	ActionIcon,
	Card,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import ChatsContext from '../contexts/ChatsContext';
import MessagesContext from '../contexts/MessagesContext';
import classes from '../css/MessageInput.module.css';

export default function MessageInput({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) {
	const [isLoading, setIsLoading] = useState(false);
	const { dispatchChats, setActive } = useContext(ChatsContext);
	const { messages, dispatch, tempIdRef } = useContext(MessagesContext);
	const { id } = useParams();
	//const [abortController, setAbortController] = useState(new AbortController() || null);

	const handleSend1 = () => {
		//tempIdRef.current = '123132';
		console.log(tempIdRef.current);
	};

	// Handle send message
	const handleSend = async () => {
		if (!isLoading && textareaRef.current) {
			try {
				setIsLoading(true);

				const text = textareaRef.current.value;

				textareaRef.current.value = '';
				textareaRef.current.focus();

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
						text: 'Печатает сообщение...',
						you: false
					}
				});

				console.log(messages);

				const requestBody = { text };

				const url = 'http://192.168.0.116:8000/api/messages/' + (id ? id : '');

				//const controller = new AbortController();
				//setAbortController(controller);

				//const eventSource = new EventSource('http://192.168.0.116:8000/api/stream');

				//eventSource.onmessage = (e) => {
				//	console.log(e.data);
				//};

				try {
					const response = await fetch(url, {
						method: "POST",
						body: JSON.stringify(requestBody),
						headers: {
							'Content-Type': 'application/json'
						},
						credentials: "include",
						//signal: controller.signal,
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
							const { message, answerId, messageId, chatId, tempId } = parsedLine;
							
							//console.log(answer, message);

							//console.log(answerId, messageId);
							// Update the UI with the new content
							if (message) {
								answer += message;
								
								dispatch({
									type: 'change',
									id: -2,
									message: {
										text: answer
									}
								});
							} else if (tempId) {
								tempIdRef.current = tempId;
								console.log(tempId);
								console.log('temp', tempIdRef.current);
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
								//console.log('here');
								dispatch({
									type: 'change',
									id: -1,
									message: {
										id: answerId,
									}
								});
								//console.log('change answer');
							} else if (chatId) {
								console.log('temp', tempIdRef.current);

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

	const handleStop = async() => {
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
		<>
		<ActionIcon className={classes.link} onClick={handleStop}>
			  <span>Остановить</span>
		</ActionIcon>
		<Card shadow="0" padding="0" radius="lg" withBorder style={{ width: '100%' }}>
			<Group justify="right" p="xs" style={{ padding: '5px 20px 5px 20px', alignItems: 'end' }}>
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
				<ActionIcon
					onClick={handleSend}
					variant="transparent"
					size="lg"
					className={classes.send}
				>
					<IconSend stroke={1.5} className={classes.linkIcon} />
				</ActionIcon>
			</Group>
		</Card>
		</>
	);
}
