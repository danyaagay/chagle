import { useRef, useLayoutEffect, useCallback, useEffect, useContext, useMemo } from 'react';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';
import Message from './Message';
import { useInfiniteQuery, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '../axios';
import { useParams } from 'react-router-dom';
//import React from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { produce } from 'immer';
//import ChatsContext from '../contexts/ChatsContext';

const MessageList = () => {
    const scrollRef = useRef<any>();
    const firstLoaded = useRef<any>(true);
    const scrollSaver = useRef<any>({ last: 99999, lastHeight: 0 });
    const loading = useRef<any>();
    //const { active, setActive } = useContext(ChatsContext);
    const { id } = useParams();

    const queryClient = useQueryClient();

    const { data: tempData }: any = useQuery({ queryKey: ['messages', 'temp'] });
    const { data: tempDataId }: any = useQuery({ queryKey: ['messages', 'temp' + id] });

    const {
        data: realData,
        fetchNextPage,
        hasNextPage,
    }: any = useInfiniteQuery({
        queryKey: ['messages', id],
        queryFn: async ({ pageParam }) => {
            const res = await axios.get(`/messages/${id}?offset=${pageParam}`);
            return res.data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: any, allPages, lastPageParam) => {
            if (!lastPage.hasMore) {
                return undefined;
            }
            return lastPageParam ? lastPageParam + 30 : tempDataId ? lastPage.messages.length + tempDataId?.pages[0].messages.length : lastPage.messages.length;
        },
        select: useCallback(
            (data: any) => ({
                pages: [...data.pages].reverse(),
                pageParams: [...data.pageParams].reverse(),
            }),
            []
        ),
        enabled: !!id,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,

        initialData: () => {
            queryClient.removeQueries({ queryKey: ['messages', 'temp'] });
            return tempData;
        },
    });

    const data = id ? realData : tempData;

    const itemsA = data?.pages.flatMap((page: any) => page.messages);
    const itemsB = tempDataId?.pages.flatMap((page: any) => page.messages);

    const allItems = itemsB ? itemsA.concat(itemsB) : itemsA;

    //useEffect(() => {
    //    //console.log(tempDataId);
    //    console.log(data);
    //}, [data]);

    //Датировка
    useEffect(() => {
        queryClient.setQueryData(['messages', id],
            (oldData: any) => {
                if (oldData) {
                    return produce(oldData, (draft: any) => {
                        console.log('Процесс датировки начат');
                        let currentDate: any;

                        draft.pages.forEach((page: any) => {
                            page.messages.forEach((message: any) => {
                                const today = dayjs();
                                const date = dayjs(message.date);
                                let formattedDate;

                                if (!currentDate || !currentDate.isSame(date, 'day')) {
                                    if (today.isSame(date, 'day')) {
                                        formattedDate = 'Сегодня';
                                    } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
                                        formattedDate = 'Вчера';
                                    } else {
                                        const now = dayjs();
                                        if (date.year() !== now.year()) {
                                            formattedDate = date.locale('ru').format('D MMMM YYYY');
                                        } else {
                                            formattedDate = date.locale('ru').format('D MMMM');
                                        }
                                    }
                                }

                                currentDate = date;

                                message.marker = formattedDate ? formattedDate : undefined;
                            });
                        });
                    });
                }
                return oldData;
            }
        );
    }, [allItems?.length]);

    //Запаздание для анимаций ios?
    const onLoadOldMessages = useCallback(
        () => {
            new Promise<void>((resolve) =>
                setTimeout(() => {
                    fetchNextPage();

                    //console.log('content add');

                    resolve();
                }, (IS_MOBILE ? 1000 : 100))
            )
        },
        []
    );

    useLayoutEffect(() => {
        //console.log('new page');
        return () => {
            firstLoaded.current = true;
            loading.current = true;
        }
    }, [id]);

    useLayoutEffect(() => {
        //исправление при формировании сообщения в несколько строк некорректно задавалось начальное положение прокрутки вниз
        if (scrollSaver.current.lastDown < 1 && scrollSaver.current.lastDown >= 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        //console.log(scrollSaver.current.lastDown);
        scrollSaver.current.lastDown = scrollRef.current.scrollHeight - scrollRef.current.clientHeight - scrollRef.current.scrollTop;
    }, [allItems]);

    useLayoutEffect(() => {
        scrollRef.current.scrollTop = (scrollRef.current.scrollHeight - scrollSaver.current.lastHeight) + (scrollSaver.current.last > 0 ? scrollSaver.current.last : 0);

        if (IS_MOBILE) {
            reflowScrollableElement();
        }

        loading.current = false;

        if (allItems?.length && scrollRef.current.offsetHeight == scrollRef.current.scrollHeight && hasNextPage) {
            loading.current = true;
            fetchNextPage();
        } else if (allItems?.length && firstLoaded.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            //console.log('donefirst', scrollRef.current.scrollTop);
            firstLoaded.current = false;
        }
    }, [allItems?.length]);

    const handleScroll = () => {
        if (scrollRef.current) {
            //формула работает и на компьютере чтобы при написании сообщения прокрутка отправлялась вниз если она была внизу
            //без формулы scrollTop 0 нужно править на 1-2 пикселя для того чтобы
            //при прогрузке старых смс сохранять позицию
            scrollSaver.current.last = scrollRef.current.scrollTop;
            scrollSaver.current.lastHeight = scrollRef.current.scrollHeight;
            scrollSaver.current.lastDown = scrollRef.current.scrollHeight - scrollRef.current.clientHeight - scrollRef.current.scrollTop;

            //console.log('scroll save', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

            //console.log(scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100);
            //const scrollPrecent = scrollRef.current.scrollTop / scrollRef.current.scrollHeight * 100;

            //console.log(loading.current)

            if (scrollRef.current.scrollTop <= 300 && !loading.current && hasNextPage) {
                loading.current = true;

                //console.log('load new messages', scrollRef.current.scrollTop, scrollRef.current.scrollHeight, scrollRef.current.scrollHeight - scrollRef.current.scrollTop);

                onLoadOldMessages();
            }
        }
    }

    const reflowScrollableElement = () => {
        scrollRef.current.style.display = 'none';
        void scrollRef.current.offsetLeft; // reflow
        scrollRef.current.style.display = '';
    }

    return (
        <div className="messages">
            {!IS_MOBILE ? (
                <Scrollbars
                    autoHide
                    ref={(scrollbars: any) => { scrollRef.current = scrollbars?.view; }}
                    onScroll={handleScroll}
                >
                    <div className='messagesBox'>

                        {allItems?.map((message: any) => (
                            <Message
                                key={message.id}
                                text={message.text}
                                marker={message.marker}
                                you={message.you}
                                time={message.time}
                                is_error={message.is_error}
                            />
                        ))}
                    </div>
                </Scrollbars>
            ) : (
                <div
                    className='scrollable scrollable-y'
                    style={{
                        height: '100%',
                        overflow: 'auto',
                    }}
                    onScroll={handleScroll}
                    ref={scrollRef}
                >
                    <div className='messagesBox'>

                        {allItems?.map((message: any) => (
                            <Message
                                key={message.id}
                                text={message.text}
                                marker={message.marker}
                                you={message.you}
                                time={message.time}
                                is_error={message.is_error}
                            />
                        ))}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default MessageList;