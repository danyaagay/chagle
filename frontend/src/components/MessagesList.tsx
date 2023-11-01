import { useContext, useEffect, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { Scrollbars } from 'react-custom-scrollbars';
import useInfiniteScroll from 'react-infinite-scroll-hook';

const MessageList = ({ messagesEndRef }: { messagesEndRef: React.RefObject<HTMLInputElement> }) => {
    const { messages, dispatch } = useContext(MessagesContext);
    const { id } = useParams();
    const [ page, setPage ] = useState(2);

    const [ loading, setLoading ] = useState(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [error, setError] = useState<Error | boolean>(false);
    const [infiniteRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage,
        onLoadMore: loadMore,
        disabled: !!error,
        rootMargin: '800px 0px 0px 0px',
    });

    const scrollBar = useRef<Scrollbars>(null);

    async function loadMore() {
        setLoading(true);
        try {
            const resp = await axios.get(`/messages/${id}?page=${page}`);
            if (resp.status === 200) {
                if (id) {
                    dispatch({ type: 'addSet', messages: resp.data.messages });
                    setPage(page + 1);
                    setLoading(false);
                    setHasNextPage(resp.data.hasMore);
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                setError(error);
            }
        } finally {
            setLoading(false);
        }
    }
    
    const scrollableRootRef = useRef<HTMLDivElement | null>(null);
    const lastScrollDistanceToBottomRef = useRef<number>();

    // Messeges send or update to bottom
    useLayoutEffect(() => {
        const scrollableRoot = scrollableRootRef.current;
        const lastScrollDistanceToBottom =
          lastScrollDistanceToBottomRef.current ?? 0;
        if (scrollableRoot) {
          scrollableRoot.scrollTop =
            scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
        }
    }, [messages, rootRef]);

    const rootRefSetter = useCallback(
        (node: HTMLDivElement) => {
          rootRef(node);
          scrollableRootRef.current = node;
        },
        [rootRef],
    );
    
    const handleRootScroll = useCallback(() => {
        const rootNode = scrollableRootRef.current;
        if (rootNode) {
            console.log('scrolling');
          const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
          lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
        }
    }, []);

    let test;

    const handleScrollbarsMount = (scrollbars) => {
        test = scrollbars?.view;
    }

    useEffect(() => {
        rootRefSetter(test);
    }, [test])

    return (
        <div className="bubbles">
            <Scrollbars autoHide ref={handleScrollbarsMount} onScroll={handleRootScroll}>
                <div className='bubbles-inner'>

                    {hasNextPage && (
                        <div ref={infiniteRef}>
                        </div>
                    )}
                    
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
            </Scrollbars>
        </div>
    );
};

export default MessageList;