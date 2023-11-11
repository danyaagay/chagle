import { useContext, useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import Message from './Message';

const MessageList = () => {
    //const mobileScreen = useMediaQuery('(max-width: 767px)');

    const scrollRef = useRef<any>();
    const [{ messages }, setState] =
        useState<any>({
            messages: [
                {
                    id: 1,
                    authorId: 1,
                    message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
                },
                {
                    id: 2,
                    authorId: 1,
                    message: 'Rly is.',
                },
                {
                    id: 3,
                    authorId: 1,
                    message: 'Long group.',
                },
                {
                    id: 4,
                    authorId: 0,
                    message: 'My message.',
                },
                {
                    id: 5,
                    authorId: 0,
                    message: 'One more.',
                },
                {
                    id: 6,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
                {
                    id: 7,
                    authorId: 1,
                    message: 'I said group.',
                },
                {
                    id: 8,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
                {
                    id: 9,
                    authorId: 1,
                    message: 'I said group.',
                },
                {
                    id: 10,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
                {
                    id: 11,
                    authorId: 1,
                    message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
                },
                {
                    id: 12,
                    authorId: 1,
                    message: 'Rly is.',
                },
                {
                    id: 13,
                    authorId: 1,
                    message: 'Long group.',
                },
                {
                    id: 14,
                    authorId: 0,
                    message: 'My message.',
                },
                {
                    id: 15,
                    authorId: 0,
                    message: 'One more.',
                },
                {
                    id: 16,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
                {
                    id: 17,
                    authorId: 1,
                    message: 'I said group.',
                },
                {
                    id: 18,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
                {
                    id: 19,
                    authorId: 1,
                    message: 'I said group.',
                },
                {
                    id: 20,
                    authorId: 1,
                    message: 'One more group to see the scroll.',
                },
            ],
            messageText: '',
        });

    const onLoadOldMessages = useCallback(
        () => {
            new Promise<void>((resolve) =>
                setTimeout(() => {
                    setState((previousState) => ({
                        ...previousState,
                        messages: new Array(30)
                            .fill(1)
                            .map(
                                (e, i) =>
                                ({
                                    id: Math.random(),
                                    message: 'Old message ' + (i + 1).toString(),
                                    authorId: Math.round(Math.random()),
                                })
                            )
                            .concat(previousState.messages),
                    }));

                    //console.log('content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
                    //scrollRef.current.scrollTop = scrollSaver.current.last + ;
                    //loading.current = false;

                    resolve();
                }, 1000)
            )
        },
        []
    );

    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useLayoutEffect(() => {
        //if (scrollRef.current.scrollHeight != scrollSaver.current.lastHeight) {
        scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + (scrollSaver.current.last > 0 ? scrollSaver.current.last : 0);
        console.log('updated content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
        loading.current = false;
        reflowScrollableElement();
        //}
    }, [messages]);

    const scrollSaver = useRef<any>({ last: 99999, lastHeight: 0 });
    const loading = useRef<any>();
    const handleScroll = () => {
        if (scrollRef.current) {

            //if (scrollRef.current.scrollTop === 0) {
            //	scrollRef.current.scrollTop = 1;
            //}
            console.log(scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
            if (scrollRef.current.scrollTop <= 300 && !loading.current && scrollRef.current.scrollTop < scrollSaver.current.last) {
                loading.current = true;
                console.log('load new messages', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
                onLoadOldMessages();
            }
            scrollSaver.current.last = scrollRef.current.scrollTop;
            scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
        }
    }

    const reflowScrollableElement = () => {
        scrollRef.current.style.display = 'none';
        void scrollRef.current.offsetLeft; // reflow
        scrollRef.current.style.display = '';
    }

    return (
        <div className="bubbles">

            <div
                className='scrollable scrollable-y'
                style={{
                    height: '100%',
                    overflow: 'auto',
                }}
                onScroll={handleScroll}
                ref={scrollRef}
            >
                <div className='bubbles-inner'>
                    {messages && messages.map((message) => (
                        <Message
                            key={message.id}
                            text={message.message}
                            marker={message.marker}
                            you={message.authorId === 1 ? true : false}
                            time={'false'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MessageList;