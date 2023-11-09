import { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import useStateRef from 'react-usestateref'
import {IS_OVERLAY_SCROLL_SUPPORTED} from '../environment/overlayScrollSupport';

const InfiniteBox4 = () => {
    const { messages, dispatch } = useContext(MessagesContext);
    const { id } = useParams();
    
    const [isLoading, setIsLoading, isLoadingRef] = useStateRef(false);
    const [hasMany, setHasMany, hasManyRef] = useStateRef(true);
    const [page, setPage, pageRef] = useStateRef(1);

    const SCROLL_THROTTLE = 24;
    const USE_OWN_SCROLL = !IS_OVERLAY_SCROLL_SUPPORTED;

    const onScrollOffset = 300;
    let lastScrollDirection = 0;
    let lastScrollPosition = 0;
    let onScrollMeasure = 0;
    const scrollPositionProperty = 'scrollTop';

    const scrollRef = useRef(null);

    const scrollSaver = useRef({
        scrollHeight: 0,
        scrollTop: 0,
        clientHeight: 0,
        scrollHeightMinusTop: 0
    });

    useEffect(() => {
        if (scrollSaver.current.scrollHeight) {
            restoreScroll();
        }
    }, [messages]);

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

    let throttleMeasurement: (callback: () => void) => number,
    cancelMeasurement: (id: number) => void;
    if(USE_OWN_SCROLL) {
        throttleMeasurement = (callback) => requestAnimationFrame(callback);
        cancelMeasurement = (id) => cancelAnimationFrame(id);
    } else {
        throttleMeasurement = (callback) => window.setTimeout(callback, SCROLL_THROTTLE);
        cancelMeasurement = (id) => window.clearTimeout(id);
    }

    async function loadMore() {
        setIsLoading(true);
        saveScroll();
        //console.log('fetching');
        try {
            //console.log('add', id, pageRef.current, hasManyRef.current)
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

    const handleScroll = () => {
        if (isLoadingRef.current) return;

        if(!loadMore) return;
        if(onScrollMeasure) return;
        onScrollMeasure = throttleMeasurement(() => {
            onScrollMeasure = 0;
      
            const scrollPosition = scrollRef.current[scrollPositionProperty];
            lastScrollDirection = lastScrollPosition === scrollPosition ? 0 : (lastScrollPosition < scrollPosition ? 1 : -1);
            lastScrollPosition = scrollPosition;
            
            console.log(scrollPosition);
      
            if(checkForTriggers) {
                checkForTriggers();
            }
        });
    };

    const checkForTriggers = () => {
        if(!loadMore) return;
    
        const scrollHeight = scrollRef.current.scrollHeight;
        if(!scrollHeight) {
          return;
        }
    
        const clientHeight = scrollRef.current.clientHeight;
        const maxScrollTop = scrollHeight - clientHeight;
        const scrollTop = lastScrollPosition;
    
        if(loadMore && scrollTop <= onScrollOffset && lastScrollDirection <= 0 && hasManyRef.current) {
            setIsLoading(true);
            console.log('in top');
            loadMore();
        }

    
        if((maxScrollTop - scrollTop) <= onScrollOffset && lastScrollDirection >= 0) {
            console.log('in button');
        }
    };

    const saveScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        scrollSaver.current.scrollHeight = scrollHeight + 300;
        scrollSaver.current.scrollTop = scrollTop;
        scrollSaver.current.clientHeight = clientHeight;
        scrollSaver.current.scrollHeightMinusTop = scrollHeight - scrollTop;
    }

    const restoreScroll = () => {

        const scrollHeight = scrollSaver.current.scrollHeight;
    
        const newScrollTop = scrollHeight - scrollSaver.current.scrollHeightMinusTop;

        lastScrollPosition = newScrollTop;
        ignoreNextScrollEvent();
        scrollRef.current[scrollPositionProperty] = newScrollTop;

    }

    let addedScrollListener: boolean;

    const ignoreNextScrollEvent = () => {
        removeScrollListener();
        scrollRef.current.addEventListener('scroll', (e) => {
          //cancelEvent(e);
          addScrollListener();
        }, {capture: true, passive: false, once: true});
    }

    const removeScrollListener = () => {
        if(!addedScrollListener) {
          return;
        }
    
        addedScrollListener = false;
        scrollRef.current.removeEventListener('scroll', handleScroll, {capture: true});
    }

    const addScrollListener = () => {
        if(addedScrollListener) {
          return;
        }
    
        addedScrollListener = true;
        scrollRef.current.addEventListener('scroll', handleScroll, {passive: true, capture: true});
    }

    useLayoutEffect(() => {
        scrollRef.current[scrollPositionProperty] = scrollRef.current.scrollHeight;
        addScrollListener();
    }, []);

   // onMouseMove = (e: MouseEvent) => {
   //     cancelEvent(e);
   // };
   // 
   // onMouseDown = (e: MouseEvent) => {
   //     cancelEvent(e);
   // };
//
   // const cancelEvent = (event?: Event) => {
   //     event ||= window.event;
   //     if(event) {
   //       // 'input' event will have cancelable=false, but we still need to preventDefault
   //       // if(!event.cancelable) {
   //       //   return false;
   //       // }
   //   
   //       // @ts-ignore
   //       event = event.originalEvent || event;
   //   
   //       try {
   //         if(event.stopPropagation) event.stopPropagation();
   //         if(event.preventDefault) event.preventDefault();
   //         event.returnValue = false;
   //         event.cancelBubble = true;
   //       } catch(err) {}
   //     }
   //   
   //     return false;
   // }

    return (
        <div
            className='scrollable scrollable-y'
            style={{
                height: '100%',
            }}
            ref={scrollRef}
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

export default InfiniteBox4;