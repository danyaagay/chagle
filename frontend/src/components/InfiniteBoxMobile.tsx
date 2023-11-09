import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import useStateRef from 'react-usestateref'

const InfiniteBoxMobile = () => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);

    const location = useLocation();

    const tempLocation = useRef<any>();
    useLayoutEffect(() => {
        if (location != tempLocation.current){
            scrollRef.current['scrollTop'] = 0;
            tempLocation.current = location;
        }
    }, [messages]);

    let stopScrolling = false;

    const handleTouchMove = (e:any) => {
        if (!stopScrolling) {
            return;
        }
        e.preventDefault();
    }

    const onTouchStart = (event) => {
        scrollRef.current.style.overflow = 'auto';
        stopScrolling = false;
    };

    const onScroll = (event) => {
        console.log(scrollRef.current['scrollTop']);
        if (scrollRef.current['scrollTop'] === 0 || scrollRef.current['scrollTop'] === 1) {
            scrollRef.current.style.overflow = 'visible';
            stopScrolling = true;
        }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

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
            autoFocus
            onTouchStart={onTouchStart}
            onTouchMove={onTouchStart}
            ref={scrollRef}
            onScroll={onScroll}
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

export default InfiniteBoxMobile;