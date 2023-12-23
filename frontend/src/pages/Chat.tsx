import { useEffect, useRef } from 'react';
import MessagesList from '../components/MessagesList';
import MessageInput from '../components/MessageInput';
import { IS_IOS } from '../environment/userAgent';

export default function Chat() {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
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

		if (IS_IOS) {
			document.documentElement.classList.add('is-ios');
			//window.visualViewport!.addEventListener('resize', setVH);
		} else {
			window.addEventListener('resize', setVH);
		}

		setVH();
	}, []);

	return (
		<div className='container'>
			<MessagesList />
			<MessageInput textareaRef={textareaRef} />
		</div>
	);
}