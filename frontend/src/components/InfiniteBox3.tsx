import { useContext, useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { ReallySimpleInfiniteScroll } from "react-really-simple-infinite-scroll";

const InfiniteBox3 = () => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);
    const location = useLocation();

    const onInfiniteLoadCallback = useCallback(() => {
        loadMore();
    }, []);
    
      useEffect(() => {
        onInfiniteLoadCallback();
      }, [onInfiniteLoadCallback]);



    return (


            <ReallySimpleInfiniteScroll
                length={messages ? messages.length : 10}
                hasMore={true}
                scrollThreshold="200px"
                className='scrollable scrollable-y'
                onInfiniteLoad={onInfiniteLoadCallback}
                displayInverse={true}
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
                <div ref={scrollRef} />
            </ReallySimpleInfiniteScroll>
            

    );
};

export default InfiniteBox3;