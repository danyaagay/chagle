import { useRef } from 'react';
import MessagesList from '../components/MessagesList';
import MessageInput from '../components/MessageInput';

export default function Chat() {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	return (
		<div className='container'>
			<MessagesList />
			<MessageInput textareaRef={textareaRef} />
		</div>
	);
}