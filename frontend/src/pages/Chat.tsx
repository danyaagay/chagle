import { useEffect, useRef } from 'react';
import { MessagesProvider } from '../contexts/MessagesContext';
import MessagesList from '../components/MessagesList';
import MessageInput from '../components/MessageInput';

export default function Chat() {
	const chatInputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
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
		};
	}, []);

	return (
		<MessagesProvider>
		<div className='whole page-chats'>
			<div className="chat tabs-tab active">
				<MessagesList scrollRef={scrollRef} messagesEndRef={messagesEndRef} />
				<div className='chat-input' ref={chatInputRef}>
					<div className='chat-input-container'>
						<MessageInput textareaRef={textareaRef} />
					</div>
				</div>
			</div>
		</div>
		</MessagesProvider>
	);
}