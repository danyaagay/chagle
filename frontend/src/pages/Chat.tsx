import { useEffect, useRef } from 'react';
import MessagesList from '../components/MessagesList';
import MessageInput from '../components/MessageInput';

export default function Chat() {
	const chatInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
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

		// Fix height
		const w = (window.visualViewport || window) as Window & typeof window.visualViewport;
		let setViewportVH = false; // HasFocus = false
		let lastVH: number | undefined;
		const setVH = (): void => {
			let vh = (setViewportVH ? w.height || w.innerHeight : window.innerHeight) * 0.01;
			vh = +vh.toFixed(2);
			if (lastVH === vh) {
				return;
			}

			lastVH = vh;

			document.documentElement.style.setProperty('--vh', `${vh}px`);
		};

		setVH();
	}, []);

	return (

		<div className='whole page-chats'>
			<div className="chat tabs-tab active">
				<MessagesList />
				<div className='chat-input' ref={chatInputRef}>
					<div className='chat-input-container'>
						<MessageInput textareaRef={textareaRef} />
					</div>
				</div>
			</div>
		</div>

	);
}