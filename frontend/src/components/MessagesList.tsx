import { useContext, useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';
import Message from './Message';

const MessageList = () => {
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
                    setState((previousState: any) => ({
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

                    console.log('content add');

                    resolve();
                }, (IS_MOBILE ? 1000 : 100))
            )
        },
        []
    );

    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    const firstLoaded = useRef<any>(true);

    useLayoutEffect(() => {
        if (IS_MOBILE) {
            scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + (scrollSaver.current.last > 0 ? scrollSaver.current.last : 0);
            
            //console.log('updated content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
            
            reflowScrollableElement();
        }

        loading.current = false;

        if (firstLoaded.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

        if (scrollRef.current.offsetHeight > scrollRef.current.scrollHeight) {
            loading.current = true;
            onLoadOldMessages();
        } else {
            firstLoaded.current = false;
        }
    }, [messages]);

    const scrollSaver = useRef<any>({ last: 99999, lastHeight: 0 });
    const loading = useRef<any>();
    const handleScroll = () => {
        if (scrollRef.current) {
            if (!IS_MOBILE) {
                if (scrollRef.current.scrollTop === 0) {
                    scrollRef.current.scrollTop = 2;
                    console.log('current scroll fixed');
                }
            } else {
                scrollSaver.current.last = scrollRef.current.scrollTop;
                scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
            }

            //console.log(scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

            //console.log(scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100);
            //const scrollPrecent = scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100;

            if (scrollRef.current.scrollTop <= 300 && !loading.current) {
                loading.current = true;

                //console.log('load new messages', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
                
                onLoadOldMessages();
            }
        }
    }

    const reflowScrollableElement = () => {
        scrollRef.current.style.display = 'none';
        void scrollRef.current.offsetLeft; // reflow
        scrollRef.current.style.display = '';
    }

    return (
        <div className="bubbles">
            {!IS_MOBILE ? (
                <Scrollbars
                    autoHide
                    ref={(scrollbars: any) => { scrollRef.current = scrollbars?.view; }}
                    onScroll={handleScroll}
                >
                    <div className='bubbles-inner'>
                        {messages && messages.map((message: any) => (
                            <Message
                                key={message.id}
                                text={message.message}
                                marker={message.marker}
                                you={message.authorId === 1 ? true : false}
                                time={'false'}
                            />
                        ))}
                    </div>
                </Scrollbars>
            ) : (
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
                        {messages && messages.map((message: any) => (
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
            )
            }
        </div >
    );
};

export default MessageList;