import { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import useStateRef from 'react-usestateref'

const InfiniteBoxMobile = () => {
    const { messages, dispatch } = useContext(MessagesContext);

    const location = useLocation();
    const { id } = useParams();

    const [page, setPage, pageRef] = useStateRef(1);
    const [hasMore, setHasMore, hasMoreRef] = useStateRef<boolean>(true);
    const scrollRef = useRef<HTMLInputElement>(null);

    const tempLocation = useRef<any>();
    useLayoutEffect(() => {
        if (location != tempLocation.current){
            scrollRef.current?.scrollIntoView();
            tempLocation.current = location;
        }
    }, [messages]);

    const controller = new AbortController();

    useEffect(() => {
        dispatch({ type: 'set', messages: null });
        setPage(1);
        setHasMore(false);
		loadMore(true)
    }, [location]);

    const loadMore = async (first = false) => {
        console.log(`${id}:`, 'fetching', page, pageRef.current, hasMore, hasMoreRef.current, `first: ${first}`);

        try {
            const resp = await axios.get(`/messages/${id}?page=${pageRef.current}`, { signal: controller.signal });
            if (resp.status === 200) {
                if (id) {
                    if (first) {
                        dispatch({ type: 'set', messages: resp.data.messages });
                    } else {
                        dispatch({ type: 'addSet', messages: resp.data.messages });
                    }
                    setPage(pageRef.current + 1);
                    setHasMore(resp.data.hasMore);
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                console.log(error);
            }
        }
    }

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
                <div ref={scrollRef} />
            </InfiniteScroll>
            
        </div>
    );
};

export default InfiniteBoxMobile;