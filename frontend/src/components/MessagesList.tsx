import { useContext, useRef, useLayoutEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MessagesContext from '../contexts/MessagesContext';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';
import Message from './Message';

const MessageList = () => {
    const { messages, loadMore, hasMoreRef } = useContext(MessagesContext);
    const location = useLocation();
    const scrollRef = useRef<any>();
    const firstLoaded = useRef<any>(true);
    const scrollSaver = useRef<any>({ last: 99999, lastHeight: 0 });
    const loading = useRef<any>();

    const onLoadOldMessages = useCallback(
        () => {
            new Promise<void>((resolve) =>
                setTimeout(() => {
                    loadMore();

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
        return () => {
            firstLoaded.current = true;
            loading.current = true;
        }
    }, [location]);

    useLayoutEffect(() => {

        scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + (scrollSaver.current.last > 0 ? scrollSaver.current.last : 0);

        //console.log('updated content add', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);
        if (IS_MOBILE) {
            reflowScrollableElement();
        }

        loading.current = false;

        //scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

        if (messages?.length && scrollRef.current.offsetHeight > scrollRef.current.scrollHeight && hasMoreRef.current) {
            loading.current = true;
            loadMore();
        } else if (messages?.length && firstLoaded.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            firstLoaded.current = false;
        }
    }, [messages]);

    const handleScroll = () => {
        if (scrollRef.current) {
            //if (!IS_MOBILE) {
            //    if (scrollRef.current.scrollTop === 0) {
            //        scrollRef.current.scrollTop = 2;
            //        console.log('current scroll fixed');
            //    }
            //}
            //else {
                scrollSaver.current.last = scrollRef.current.scrollTop;
                scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
            //}

            //console.log(firstLoaded.current, scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

            //console.log(scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100);
            //const scrollPrecent = scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100;

            if (scrollRef.current.scrollTop <= 300 && !loading.current && hasMoreRef.current) {
                loading.current = true;

                console.log('load new messages', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

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
            )
            }
        </div >
    );
};

export default MessageList;