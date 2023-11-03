import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import InfiniteScroll from 'react-infinite-scroller';

const InfiniteBoxMobile = () => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);
    const location = useLocation();
    const { id } = useParams();

    const tempLocation = useRef();
    useLayoutEffect(() => {
        if (location != tempLocation.current){
            scrollRef.current?.scrollIntoView();
            tempLocation.current = location;
        }
    }, [messages]);

    return (

                <div className='bubbles-inner scrollable scrollable-y'>
                    <InfiniteScroll
                        pageStart={1}
                        loadMore={loadMore}
                        hasMore={hasMoreRef.current}
                        isReverse={true}
                        useWindow={false}
                        initialLoad={false}

                    >
                        {messages && messages.map((message) => (
                            <Message
                                key={message.id}
                                text={message.text}
                                marker={message.marker}
                                you={message.you}
                                time={message.time}
                            />
                        ))}
                    </InfiniteScroll>
                    <div ref={scrollRef} />
                </div>
         
    );
};

export default InfiniteBoxMobile;