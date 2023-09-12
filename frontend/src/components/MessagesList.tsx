import { useContext, useEffect } from 'react';
import {
	Loader,
} from '@mantine/core';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';

const MessageList = ({scrollRef, messagesEndRef}: {scrollRef: React.RefObject<HTMLInputElement>, messagesEndRef: React.RefObject<HTMLInputElement>}) => {
	const { messages, loading } = useContext(MessagesContext);

    // Messeges send or update to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView();
	}, [messages]);
  
	return (
        <div className="bubbles">
            {(loading ? <Loader /> : '')}
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
	);
};

export default MessageList;