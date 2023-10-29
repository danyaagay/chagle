import { useContext, useLayoutEffect, useRef } from 'react';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useMediaQuery } from '@mantine/hooks';

const MessageList = ({ messagesEndRef }: { messagesEndRef: React.RefObject<HTMLInputElement> }) => {
    const { messages } = useContext(MessagesContext);
    const mobileScreen = useMediaQuery('(max-width: 767px)');

    const scrollBar = useRef();

    // Messeges send or update to bottom
    useLayoutEffect(() => {
        messagesEndRef.current?.scrollIntoView();
        scrollBar.current?.scrollToBottom();
    }, [messages]);

    return (
        <div className="bubbles">
            <Scrollbars autoHide ref={scrollBar}>
                <div className='bubbles-inner'>
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
            </Scrollbars>
        </div>
    );
};

export default MessageList;