import { createContext, useEffect, useReducer, useState, ReactNode, useContext, useRef } from 'react';
import useStateRef from 'react-usestateref'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

type Message = {
    id: number;
    date: string;
    text: string;
    marker?: string;
    time: string;
    you?: boolean;
};

type MessagesContextProps = {
    messages: Message[] | null;
    dispatch: React.Dispatch<Action>;
    hasMoreRef: React.RefObject<boolean>;
    loadMore: () => Promise<void>;
    scrollRef: React.RefObject<HTMLInputElement>;
    tempIdRef: React.MutableRefObject<string>;
};

const MessagesContext = createContext<MessagesContextProps>({
    messages: null,
    dispatch: () => { },
    hasMoreRef: { current: true },
    loadMore: async () => {},
    scrollRef: { current: null },
    tempIdRef: { current: "" },
});

type MessagesProviderProps = {
    children: ReactNode;
};

function MessagesProvider(props: MessagesProviderProps) {
    const { chats } = useContext(ChatsContext);
    const [messages, dispatch] = useReducer(messagesReducer, null);
    const tempIdRef = useRef('');

    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const { opened, toggle } = useContext(MobileHeaderContext);

    const [page, setPage, pageRef] = useStateRef(1);
    const [hasMore, setHasMore, hasMoreRef] = useStateRef<boolean>(true);

    const scrollRef = useRef<HTMLInputElement>(null);

    const controller = new AbortController();

    const loadMore = async (first = false) => {
        //console.log(`${id}:`, 'fetching', page, pageRef.current, hasMore, hasMoreRef.current, `first: ${first}`);

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

    useEffect(() => {
        tempIdRef.current = '';

        if (id) {
            dispatch({ type: 'set', messages: null });
            setPage(1);
            setHasMore(false);
            if (opened) {
                toggle();
            }
            loadMore(true);
        } else {
            controller.abort();
            dispatch({ type: 'set', messages: null });
            setPage(1);
            setHasMore(false);
            if (opened) {
                toggle();
            }
        }
    }, [location]);

    useEffect(() => {
        if (chats && chats.length > 0 && id) {
            const chatExists = chats.some(chat => chat.id == id);
            if (chatExists) {
                //setPage(1);
                //setHasMore(true);
                //loadMore();
            } else {
                controller.abort();
                navigate('/chat');
            }
        }
    }, [chats]);

    return (
        <MessagesContext.Provider value={{ messages, dispatch, hasMoreRef, loadMore, scrollRef, tempIdRef }}>
            {props.children}
        </MessagesContext.Provider>
    );
}

const addMarker = (messages: Message[]) => {
    let currentDate: any;

    messages.forEach((message, index) => {
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

        messages[index] = {
            ...message,
            ...(formattedDate ? { marker: formattedDate } : { marker: undefined })
        }
    });

    return messages;
};

type Action =
    | { type: 'set', messages: Message[] | null }
    | { type: 'addSet', messages: Message[] }
    | { type: 'add', message: { id: number, text: string, you: boolean } }
    | { type: 'change', id: number, message: { id?: number; date?: string; text?: string; marker?: string; time?: string; you?: boolean; } }
    | { type: 'delete', id: number };

function messagesReducer(messages: Message[] | null, action: Action): Message[] | null {
    if (messages === null) {
        messages = [];
    }

    switch (action.type) {
        case 'set':
            if (action.messages) {
                return addMarker(action.messages);
            } else {
                return [];
            }
        case 'addSet':
            let current = [...action.messages, ...messages];
            return addMarker(current);
        case 'add':
            const date = new Date();
            const dateFormatted = date.toISOString();

            const timeString = dateFormatted.split('T')[1].slice(0, 5);
            let [hours, minutes] = timeString.split(':');
            hours = parseInt(hours).toString();

            let marker;

            const lastMessageWithMarker = messages.filter(message => message.marker)[messages.filter(message => message.marker).length - 1];

            if (lastMessageWithMarker && lastMessageWithMarker.marker != 'Сегодня' || !lastMessageWithMarker) {
                marker = 'Сегодня';
            }

            return [...messages, {
                id: action.message.id,
                date: dateFormatted,
                time: `${hours}:${minutes}`,
                text: action.message.text,
                you: action.message.you,
                ...(marker ? { marker } : {})
            }];
        case 'change':
            return messages.map(message =>
                message.id === action.id ? {
                    ...message,
                    ...action.message
                } : message
            );
        case 'delete':
            return messages.filter(message => message.id !== action.id);
        default:
            const { type } = action as never;
            throw new Error('Unknown action: ' + type);
    }
}

export default MessagesContext;
export { MessagesProvider };
