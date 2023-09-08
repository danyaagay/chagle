import { useEffect, useState, useRef, useContext } from 'react';
import {
	IconSend
} from '@tabler/icons-react';
import {
	createStyles,
	Textarea,
	Group,
	ActionIcon,
	Card,
	Loader,
} from '@mantine/core';
import Message from '../components/Message';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import DialogsContext from '../contexts/DialogsContext';

const useStyles = createStyles((theme) => ({
	container: {
		display: 'flex',
		flexDirection: 'column',
		gridRowStart: 1,
		gridColumnStart: 1,
		alignItems: 'center',
		width: '100%',
		height: '100%',
	},
	messagesBox: {
		width: '100%',
		flex: 1,
		paddingBottom: 16,
		paddingTop: 16,
	},
	inputBox: {
		flexShrink: 0,
		paddingBottom: 16,
		flexWrap: 'nowrap',
		width: '100%',
	},
	linkIcon: {
		width: '28px',
		height: '28px',
		transform: 'rotate(40deg)',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: '100%',
		gridTemplateRows: '100%',
		height: '100%',
		width: '100%',
	}
}));

export default function Chat() {
	const chatInputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { classes } = useStyles();

	type Message = {
		id: number;
		date: string;
		text: string;
		marker?: string;
		time: string;
		you?: boolean;
	};
	type Messages = Array<Message> | null;
	const [messages, setMessages] = useState<Messages>(null);

	const { addDialog } = useContext(DialogsContext);
	  
	const [loading, setLoading] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();

	const { id } = useParams();

	useEffect(() => {
		// Get all messages in chat
		const controller = new AbortController();
		
		const fetchData = async () => {
			try {
				setLoading(true);
				const resp = await axios.get(`/messages/${id}`, { signal: controller.signal });
				console.log(resp);
				if (resp.status === 200) {
					if (id) {
						setMessages(resp.data.messages);
					}
					setLoading(false);
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					navigate('/chat');
					console.log(error);
				}
			}
		};
		
		if (id) {
			fetchData();
		}
		
		// Disable scroll mobile
		function preventDefault(e: Event): void {
			e.preventDefault();
		}

		const wheelOpt: AddEventListenerOptions | boolean = 
			'onwheel' in document.createElement('div') ? { passive: false } : false;

		chatInputRef.current?.addEventListener('touchmove', (e: Event): void => {
			if (wantCurrect < 1) {
				console.log('scroll lock');
				e.preventDefault();
			} else {
				console.log('scroll unlock');
			}
		}, wheelOpt);

		// iOS detect
		function isiOS(): boolean {
			return [
				'iPad Simulator',
				'iPhone Simulator',
				'iPod Simulator',
				'iPad',
				'iPhone',
				'iPod'
			].includes(navigator.platform)
			// iPad on iOS 13 detection
			|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
		}

		if (isiOS()) {
			document.documentElement.classList.add('is-ios');
		}

		// Fix auto scroll on focus
		function mouseUpFix() {
			textareaRef.current?.blur();
			textareaRef.current?.focus({ preventScroll: true });
		}

		textareaRef.current?.addEventListener("mouseup", mouseUpFix);

		// Fix height
		let wantCurrect = 0;
		const w = (window.visualViewport || window) as Window & typeof window.visualViewport;
		let setViewportVH = false; // HasFocus = false
		let lastVH: number | undefined;
		const setVH = (): void => {
			let vh = (setViewportVH ? w.height || w.innerHeight : window.innerHeight) * 0.01;
			vh = +vh.toFixed(2);
			if(lastVH === vh) {
				return;
			}

			lastVH = vh;

			document.documentElement.style.setProperty('--vh', `${vh}px`);

			messagesEndRef.current?.scrollIntoView();
			wantCurrect = 0;

			chatInputRef.current?.addEventListener('touchmove', preventDefault, wheelOpt);
		};

		window.addEventListener('resize', setVH);
		setVH();

		// Focused input
		const toggleResizeMode = () => {
			setViewportVH = true;
			setVH();

			if('addEventListener' in w) {
				window.removeEventListener('resize', setVH);
				w.addEventListener('resize', setVH);
			}
		};

		textareaRef.current?.addEventListener('focus', toggleResizeMode);

		// Fix opportunity to correct what was written
		textareaRef.current?.addEventListener("click", () => {
			wantCurrect++;
		});

		// Fix scroll bounce
		const scrollContainer: HTMLElement | null = scrollRef.current;
		let startY: number | null = null;

		const touchStartHandler = (e: TouchEvent): void => {
		const touch: Touch = e.touches[0];
		startY = touch.clientY;
		};

		const touchMoveHandler = (e: TouchEvent): void => {
		const touch: Touch = e.touches[0];
		const currentY: number = touch.clientY;

		if (scrollContainer?.scrollTop === 0 && currentY > startY!) {
			e.preventDefault();
		} else if (
			scrollContainer &&
			scrollContainer?.scrollHeight - scrollContainer?.scrollTop ===
			scrollContainer?.clientHeight &&
			currentY < startY!
		) {
			e.preventDefault();
		}
		};

		scrollContainer?.addEventListener("touchstart", touchStartHandler);
		scrollContainer?.addEventListener("touchmove", touchMoveHandler);

		return () => {
			window.removeEventListener('resize', setVH);
			w.removeEventListener('resize', setVH);

			textareaRef.current?.removeEventListener('focus', toggleResizeMode);
			textareaRef.current?.removeEventListener("mouseup", mouseUpFix);

			document.documentElement.style.removeProperty('--vh');

			scrollContainer?.removeEventListener("touchstart", touchStartHandler);
			scrollContainer?.removeEventListener("touchmove", touchMoveHandler);

			controller.abort();

			setLoading(false);
			setMessages(null);
		};
	}, [location]);

	// Messeges send or update to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView();
	}, [messages]);

	// Add message
	const messageAdd = (text: string) => {
		const date = new Date(); 
		const dateFormatted = date.toISOString();
		let marker;

		if (messages && messages.length > 0) {
			const lastMessageWithMarker = messages.filter(message => message.marker)[messages.filter(message => message.marker).length - 1];

			if (lastMessageWithMarker && lastMessageWithMarker.marker != 'Сегодня') {
				marker = 'Сегодня';
			}
		}

		const newMessage = {
			id: 0,
			date: dateFormatted,
			text: text,
			time: dateFormatted.split('T')[1].slice(0, 5),
			you: true,
			...(marker ? { marker } : {})
		};

		const newMessage1 = {
			id: -1,
			date: dateFormatted,
			text: 'Печатает сообщение...',
			time: dateFormatted.split('T')[1].slice(0, 5),
			you: false
		};
		
		let newMessages;
		if (messages !== null) {
			newMessages = [...messages, newMessage, newMessage1];
		} else {
			newMessages = [newMessage, newMessage1];
		}

		setMessages(newMessages);

		return newMessages;
	}

	// Handle send message
	const handleSend = async () => {
		try {
			if (textareaRef.current) {

				const newMessages = messageAdd(textareaRef.current.value);

				const resp = await axios.post('/messages/'+ (id ? id : ''), { text: textareaRef.current.value });
				console.log(resp);
				if (resp.status === 200) {
					if (newMessages) {
						const messagesUpdate = newMessages.map(message => {
							if (message.id === 0) {
							  return {
								...message,
								id: resp.data.message.id
							  };
							} else if (message.id === -1) {
								return {
									...message,
									id: resp.data.answer.id,
									text: resp.data.answer.text
								};
							}
							return message;
						});

						setMessages(messagesUpdate);
					}

					if (resp.data.dialog) {
						addDialog(resp.data.dialog.title, resp.data.dialog.id);
						navigate('/chat/'+resp.data.dialog.id);
					}
				}
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response) {
				// Delete error
			}
		}
	};
	
	return (
		<>
		<div className='whole page-chats'>
		<div className="chat tabs-tab active">
			{(loading ? <Loader /> : '')}
			<div className="bubbles">
				<div className='bubbles-inner scrollable scrollable-y' ref={scrollRef}>
					{messages && messages.map((message) => (
						<Message 
							key={message.id}
							text={message.text}
							marker={message.marker} 
							you={message.you}
							time={message.time}
						/>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>
				<div className='chat-input' ref={chatInputRef}>
					<div className='chat-input-container'>
					<Card shadow="0" padding="0" radius="lg" withBorder style={{ width: '100%' }}>
						<Group position="right" p="xs" style={{ padding: '5px 20px 5px 20px', alignItems: 'end' }}>
							<Textarea
								ref={textareaRef}
								sx={{ flexGrow: 1 }}
								placeholder="Сообщение"
								autosize
								minRows={1}
								maxRows={6}
								size="lg"
								styles={{ 
									input: { 
										padding: '8px 9px 9px 9px !important',
										scrollbarWidth: "none",
										msOverflowStyle: "none",
										'&::-webkit-scrollbar': {width:' 0 !important'},
										fontSize: '1rem',
									}
								}}
								variant="unstyled"
							/>
							<ActionIcon
								onClick={() => {
									handleSend();
									if (textareaRef.current) {
										textareaRef.current.value = '';
										textareaRef.current.focus();
									}
								}}
								variant="hover"
								size="lg"
								style={{  margin: '5px' }}
							>
								<IconSend stroke={1.5} className={classes.linkIcon} />
							</ActionIcon>
						</Group>
					</Card>
					</div>
				</div>
			</div>
			</div>
		</>
	);
}