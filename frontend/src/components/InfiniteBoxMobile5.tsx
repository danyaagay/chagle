import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import InfiniteScroll from 'react-awesome-infinite-scroll';

const InfiniteBoxMobile4 = () => {
    const { messages, loadMore, hasMoreRef } = useContext(MessagesContext);

    const location = useLocation();

    const tempLocation = useRef<any>();
    useLayoutEffect(() => {
        //if (location != tempLocation.current){
        //    scrollRef.current['scrollTop'] = 0;
        //    tempLocation.current = location;
        //}
    }, [messages]);

    return (
        <div
            className='scrollable scrollable-y'
            style={{
                height: '100%',
            }}
        >
        <InfiniteScroll
          length={messages?.length}
          inverse
          next={loadMore}
          hasMore={hasMoreRef.current}
          height={300}
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
        </div>
    );
};

export default InfiniteBoxMobile4;