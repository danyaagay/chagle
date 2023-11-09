import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import InfiniteScroll from '../components/InfCopy';
import useStateRef from 'react-usestateref'

const InfiniteBoxMobile3 = () => {
    const { messages, loadMore, hasMoreRef } = useContext(MessagesContext);

    const location = useLocation();

    const scrollRef = useRef<HTMLInputElement>(null);

    const tempLocation = useRef<any>();
    useLayoutEffect(() => {
        if (location != tempLocation.current){
            scrollRef.current?.scrollIntoView();
            tempLocation.current = location;
        }
        //scrollRef.current?.scrollIntoView();
    }, [messages]);

    useEffect(() => {
        //scrollRef.current?.scrollIntoView();
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
            <InfiniteScroll
                dataLength={messages ? messages.length : 10}
                next={loadMore}
                inverse={true}
                initialScrollY={0}
                hasMore={hasMoreRef.current}
                loader={false}
                scrollThreshold="200px"
                scrollableTarget="scrollableDiv"
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

export default InfiniteBoxMobile3;