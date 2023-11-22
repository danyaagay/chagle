import { useContext, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
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

                    //console.log('content add');

                    resolve();
                }, (IS_MOBILE ? 1000 : 100))
            )
        },
        []
    );

    useEffect(() => {
        return () => {
            firstLoaded.current = true;
            loading.current = true;
        }
    }, [location]);

    useLayoutEffect(() => {
        //fix when generating a message in several lines, the initial position of the scroll down is set incorrectly
        if (scrollSaver.current.lastDown < 1 && scrollSaver.current.lastDown >= 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        //console.log(scrollSaver.current.lastDown);
        scrollSaver.current.lastDown = scrollRef.current.scrollHeight - scrollRef.current.clientHeight - scrollRef.current.scrollTop;
    }, [messages]);

    useLayoutEffect(() => {
        scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + (scrollSaver.current.last > 0 ? scrollSaver.current.last : 0);

        if (IS_MOBILE) {
            reflowScrollableElement();
        }

        loading.current = false;

        if (messages?.length && scrollRef.current.offsetHeight > scrollRef.current.scrollHeight && hasMoreRef.current) {
            loading.current = true;
            loadMore();
        } else if (messages?.length && firstLoaded.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            //console.log('donefirst', scrollRef.current.scrollTop);
            firstLoaded.current = false;
        }
    }, [messages?.length]);

    const handleScroll = () => {
        if (scrollRef.current) {
            //формула работает и на компьютере чтобы при написании сообщения прокрутка отправлялась вниз если она была внизу
            //без формулы scrollTop 0 нужно править на 1-2 пикселя для того чтобы
            //при прогрузке старых смс сохранять позицию
            scrollSaver.current.last = scrollRef.current.scrollTop;
            scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
            scrollSaver.current.lastDown = scrollRef.current.scrollHeight - scrollRef.current.clientHeight - scrollRef.current.scrollTop;

            //console.log('scroll save', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

            //console.log(scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100);
            //const scrollPrecent = scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100;

            if (scrollRef.current.scrollTop <= 300 && !loading.current && hasMoreRef.current) {
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
        <div className="messages">
            {!IS_MOBILE ? (
                <Scrollbars
                    autoHide
                    ref={(scrollbars: any) => { scrollRef.current = scrollbars?.view; }}
                    onScroll={handleScroll}
                >
                    <div className='messagesBox'>
                        {messages && messages.map((message) => (
                            <Message
                                key={message.id}
                                text={message.text}
                                marker={message.marker}
                                you={message.you}
                                time={message.time}
                                is_error={message.is_error}
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
                    <div className='messagesBox'>
                        {messages && messages.map((message) => (
                            <Message
                                key={message.id}
                                text={message.text}
                                marker={message.marker}
                                you={message.you}
                                time={message.time}
                                is_error={message.is_error}
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