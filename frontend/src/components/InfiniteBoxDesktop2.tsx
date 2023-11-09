import { useContext, useEffect, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { Scrollbars } from 'react-custom-scrollbars';
import useInfiniteScroll from 'react-infinite-scroll-hook';

const InfiniteBoxDesktop2 = ({ messagesEndRef }: { messagesEndRef: React.RefObject<HTMLInputElement> }) => {
    const { messages, loadMore, hasMoreRef, scrollRef } = useContext(MessagesContext);
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [infiniteRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage: hasMoreRef.current,
        onLoadMore: loadMore,
        rootMargin: '200px 0px 0px 0px',
    });

    const scrollableRootRef = useRef<HTMLDivElement | null>(null);
    const lastScrollDistanceToBottomRef = useRef<number>();

    //useEffect(() => {
    //        lastScrollDistanceToBottomRef.current = 0;
    //}, [messages, rootRef]);

    useEffect(() => {
        const scrollableRoot = scrollableRootRef.current;
        const lastScrollDistanceToBottom =
            lastScrollDistanceToBottomRef.current ?? 0;
        if (scrollableRoot) {
            console.log('set scrolling');
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
            const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
            console.log(scrollDistanceToBottom);
            lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
        }

        return () => {
            scrollableRootRef.current = null;
            lastScrollDistanceToBottomRef.current = 0;
        }
    }, []);

    return (

        <div className='scrollable scrollable-y' ref={rootRefSetter} onScroll={handleRootScroll} style={{height: 300}}>
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
        </div>

    );
};

export default InfiniteBoxDesktop2;