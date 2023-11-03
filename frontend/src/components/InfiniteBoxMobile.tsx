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

    const [loading, setLoading, loadingRef] = useStateRef(true);
    const [page, setPage, pageRef] = useStateRef(1);
    const [hasMore, setHasMore, hasMoreRef] = useStateRef<boolean>(true);
    const scrollRef = useRef<HTMLInputElement>(null);

    const { id } = useParams();

    const tempLocation = useRef();
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
        setHasMore(true);
		(async () => {
            console.log('fetching start', page, pageRef.current, hasMore, hasMoreRef.current);
			try {
				const resp = await axios.get(`/messages/${id}?page=${pageRef.current}`, { signal: controller.signal });
                if (resp.status === 200) {
                    if (id) {
                        dispatch({ type: 'set', messages: resp.data.messages });
                        setPage(pageRef.current + 1);
                        setHasMore(resp.data.hasMore);
                        setLoading(false);
                    }
                }
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					console.log(error);
				}
			}
		})();

        return () => {
            dispatch({ type: 'set', messages: null });
            setPage(1);
            setHasMore(true);
        };
    }, [location]);

    const loadMore = async () => {
        if (loadingRef.current || pageRef.current === 1) return;

        console.log('fetching', page, pageRef.current, hasMore, hasMoreRef.current);
        setLoading(true);
        try {
            const resp = await axios.get(`/messages/${id}?page=${pageRef.current}`, { signal: controller.signal });
            if (resp.status === 200) {
                if (id) {
                    if (pageRef.current === 1) {
                        console.log('set');
                        dispatch({ type: 'set', messages: resp.data.messages });
                    } else {
                        dispatch({ type: 'addSet', messages: resp.data.messages });
                    }
                    setPage(pageRef.current + 1);
                    setHasMore(resp.data.hasMore);
                    console.log('set temp', {
                        messages: resp.data.messages,
                        page: pageRef.current,
                        hasMore: hasMoreRef.current
                    });
                    setLoading(false);
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
            {/*Put the scroll bar always on the bottom*/}
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