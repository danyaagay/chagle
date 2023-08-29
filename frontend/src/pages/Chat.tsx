import React, { useEffect, useState, useRef } from 'react';
import {
	IconSend
} from '@tabler/icons-react';
import {
	createStyles,
	Textarea,
	Group,
	ActionIcon,
	Card,
	LoadingOverlay,
	Loader,
} from '@mantine/core';
import Message from '../components/ChatMessage';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useDisclosure } from '@mantine/hooks';

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
	const { classes } = useStyles();
	const chatInputRef = useRef<HTMLInputElement>(null);
	const scrollBoxRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [messages, setMessages] = useState<Array<{
		id: number;
		text: string;
		marker?: string;
		time: string;
		you?: boolean;
	}> | null>(null);
	const location = useLocation();
	const navigate = useNavigate();
	
	let chatId = useParams().id ? useParams().id : false;

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!location.pathname.includes('/chat')) {
			return;
		}

		// Get all messages in chat
		if (chatId) {
			(async () => {
				try {
					setLoading(true);
					const resp = await axios.get('/messages/'+chatId);
					console.log(resp);
					if (resp.status === 200) {
						setMessages(resp.data.messages);
						setLoading(false);
					}
				} catch (error: unknown) {
					if (error instanceof AxiosError && error.response) {
						navigate('/chat');
						console.log(error);
					}
				}
			})()
		} else {
			setMessages(null);
		}

		// Disable scroll mobile
		function preventDefault(e: Event): void {
			e.preventDefault();
		}

		const wheelOpt: AddEventListenerOptions | boolean = 
			'onwheel' in document.createElement('div') ? { passive: false } : false;

		scrollBoxRef.current?.addEventListener('touchmove', (e: Event): void => {
			if (focused || scrollBoxRef.current?.offsetHeight == scrollBoxRef.current?.scrollHeight) {
				e.preventDefault();
			}
		}, wheelOpt);

		chatInputRef.current?.addEventListener('touchmove', preventDefault, wheelOpt);

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
		let focused = false;
		function mouseUpFix() {
			textareaRef.current?.blur();
			textareaRef.current?.focus({ preventScroll: true });
			setTimeout(() => {focused = false}, 1000);
		}

		textareaRef.current?.addEventListener("mouseup", mouseUpFix);

		// Fix height
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
			
			chatInputRef.current?.addEventListener('touchmove', preventDefault, wheelOpt);
		};

		window.addEventListener('resize', setVH);
		setVH();

		// Focused input
		const toggleResizeMode = () => {
			focused = true;
			setViewportVH = true;
			setVH();
		
			if('addEventListener' in w) {
				window.removeEventListener('resize', setVH);
				w.addEventListener('resize', setVH);
			}
		};

		textareaRef.current?.addEventListener('focus', toggleResizeMode);

		// Fix opportunity to correct what was written
		let wantCurrect = 0;
		textareaRef.current?.addEventListener("click", () => {
			wantCurrect++;
			if (wantCurrect > 1) {
				chatInputRef.current?.removeEventListener('touchmove', preventDefault);
			}
		});

		return () => {
			window.removeEventListener('resize', setVH);
			w.removeEventListener('resize', setVH);
			textareaRef.current?.removeEventListener('focus', toggleResizeMode);
			textareaRef.current?.removeEventListener("mouseup", mouseUpFix);
			document.documentElement.style.removeProperty('--vh');
			// cleaning up the listeners here
		}
	}, [location.pathname]);

	return (
		<>
		<div className='whole page-chats'>
		<div className="chat tabs-tab active">
			{(loading ? <Loader /> : '')}
			<div className="bubbles"  ref={scrollBoxRef}>
				<div className='scrollable scrollable-y'>
					<div className='bubbles-inner'>
						<div className="bubbles-date-group">
							{messages && messages.map((message) => (
								<Message 
									key={message.id}
									text={message.text}
									marker={message.marker} 
									you={message.you}
									time={message.time}
								/>
							))}
						</div>
					</div>
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
								onClick={() => console.log('send message')}
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