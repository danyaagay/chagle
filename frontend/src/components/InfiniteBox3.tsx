import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { ReallySimpleInfiniteScroll } from "react-really-simple-infinite-scroll";

const InfiniteBox3 = () => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);
    const location = useLocation();

    useEffect(() => {
        loadMore();
      }, []);

    const tempLocation = useRef();
    useLayoutEffect(() => {
        if (location != tempLocation.current){
            scrollRef.current?.scrollIntoView();
            tempLocation.current = location;
        }
    }, [messages]);

    return (
        <div
            id="scrollableDiv"
            className='scrollable scrollable-y'
            style={{
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
            }}
        >
            {/*Put the scroll bar always on the bottom*/}
            <ReallySimpleInfiniteScroll
                length={messages.length}
                hasMore={hasMoreRef.current}
                scrollThreshold="200px"
                scrollableTarget="scrollableDiv"
                onInfiniteLoad={loadMore}
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
            
        </div>
    );
};

export default InfiniteBox3;