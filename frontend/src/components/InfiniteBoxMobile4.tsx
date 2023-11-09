import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import useInfiniteScroll, { ScrollDirectionBooleanState } from 'react-easy-infinite-scroll-hook';
import useStateRef from 'react-usestateref'

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

    const ref = useInfiniteScroll({
        // Function to fetch more items
        next: loadMore(),
        // The number of items loaded if you use the "Y-scroll" axis ("up" and "down")
        // if you are using the "X-scroll" axis ("left" and "right") use "columnCount" instead
        // you can also use "rowCount" and "columnCount" if you use "Y-scroll" and "X-scroll" at the same time 
        rowCount: messages?.length,
        scrollThreshold: 0.1,
        // Whether there are more items to load
        // if marked "true" in the specified direction, it will try to load more items if the threshold is reached
        // support for all directions "up", "down", "left", "right", both individually and in all directions at the same time
        hasMore: { up: false, down: false, left: false, right: false },
        reverse: { column: true }
      });

    return (
        <div
            className='scrollable scrollable-y'
            style={{
                height: 300,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
            }}
            ref={ref}
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
            
        </div>
    );
};

export default InfiniteBoxMobile4;