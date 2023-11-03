import { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import useStateRef from 'react-usestateref'
import { Scrollbars } from 'react-custom-scrollbars';

const InfiniteBox2 = () => {
    const { messages, dispatch } = useContext(MessagesContext);
    const scrollRef = useRef(null);
    const { id } = useParams();

    const scrollPositionRef = useRef();
    const [scrollTop, setScrollTop] = useState(0);
    const [isLoading, setIsLoading, isLoadingRef] = useStateRef(false);
    const [hasMany, setHasMany, hasManyRef] = useStateRef(true);
    const [page, setPage, pageRef] = useStateRef(1);

    useEffect(() => {
		(async () => {
			try {
				const resp = await axios.get(`/messages/${id}?page=${pageRef.current}`);
                if (resp.status === 200) {
                    if (id) {
                        dispatch({ type: 'set', messages: resp.data.messages });
                        setPage(pageRef.current + 1);
                        setHasMany(resp.data.hasMore);
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
        };
    }, []);

    useEffect(() => {
        const element = scrollRef.current;
        element.scrollTop = scrollTop;
    }, [messages]);

    async function loadMore() {
        setIsLoading(true);
        console.log('fetching');
        try {
            console.log('add', id, pageRef.current, hasManyRef.current)
            const resp = await axios.get(`/messages/${id}?page=${pageRef.current}`);
            if (resp.status === 200) {
                if (id) {
                    dispatch({ type: 'addSet', messages: resp.data.messages });
                    setPage(pageRef.current + 1);
                    setHasMany(resp.data.hasMore);
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                console.log(error);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleScroll = (event: any) => {
        const element = event.target;
        const scrollTop = element.scrollTop;

        const scrollPercentage = (scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
        if (scrollPercentage < -80 && !isLoadingRef.current && hasManyRef.current) {
            console.log('scroll set');
            setIsLoading(true);
            loadMore();
        }
        setScrollTop(scrollTop);
      
        //console.log("Scroll position:", scrollTop, scrollPositionRef.current, scrollPercentage);
    };


    return (
        <div
            className='scrollable scrollable-y'
            style={{
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
            }}
            ref={scrollRef}
            onScroll={handleScroll}
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

export default InfiniteBox2;