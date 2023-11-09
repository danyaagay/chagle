import { useContext, useEffect, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { Scrollbars } from 'react-custom-scrollbars';
import useInfiniteScroll from 'react-infinite-scroll-hook';

const InfiniteBoxDesktop = ({ messagesEndRef }: { messagesEndRef: React.RefObject<HTMLInputElement> }) => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [infiniteRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage: hasMoreRef.current,
        onLoadMore: loadMore,
        rootMargin: '800px 0px 0px 0px',
    });

    const scrollableRootRef = useRef<HTMLDivElement | null>(null);
    const lastScrollDistanceToBottomRef = useRef<number>();

    useEffect(() => {
            lastScrollDistanceToBottomRef.current = 0;
    }, [messages, rootRef]);

    useLayoutEffect(() => {
        const scrollableRoot = scrollableRootRef.current;
        const lastScrollDistanceToBottom =
            lastScrollDistanceToBottomRef.current ?? 0;
        if (scrollableRoot) {
            console.log(`${id} scroll:`, scrollableRoot.scrollTop, scrollableRoot.scrollHeight, lastScrollDistanceToBottom);
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
            //console.log('scrolling');
            const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
            lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
        }

        return () => {
            scrollableRootRef.current = null;
            lastScrollDistanceToBottomRef.current = 0;
        }
    }, []);

    const testRef = useRef(null);
    
    const handleScrollbarsMount = (scrollbars) => {
        testRef.current = scrollbars?.view;
    }

    useEffect(() => {
        rootRefSetter(testRef.current);
    }, [testRef.current]);

    return (

        <Scrollbars autoHide ref={handleScrollbarsMount} onScroll={handleRootScroll}>
            <div className='bubbles-inner'>
                {hasMoreRef.current && (
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

                <div ref={scrollRef} />
            </div>
        </Scrollbars>

    );
};

export default InfiniteBoxDesktop;