import { createContext, useEffect, useReducer, ReactNode, useContext, useRef } from 'react';
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
    idRef: React.MutableRefObject<any>;
    tempRef: React.MutableRefObject<any>,
};

const MessagesContext = createContext<MessagesContextProps>({
    messages: null,
    dispatch: () => { },
    hasMoreRef: { current: true },
    loadMore: async () => {},
    idRef: { current: 0 },
    tempRef: { current: {} },
});

type MessagesProviderProps = {
    children: ReactNode;
};

function MessagesProvider(props: MessagesProviderProps) {
    const { chats } = useContext(ChatsContext);
    const [ messages, dispatch ] = useReducer(messagesReducer, null);
    const tempRef = useRef<any>({});

    const navigate = useNavigate();
    const location = useLocation();

    const { id } = useParams();
    const idRef = useRef<any>(id);

    const { opened, toggle } = useContext(MobileHeaderContext);

    const offsetRef = useRef<number>(0);
    const controllerRef = useRef<any>();
    const hasMoreRef = useRef<boolean>(true);

    const loadMore = async (first = false) => {
        console.log(`${idRef.current}:`, 'fetching', offsetRef.current, hasMoreRef.current, `first: ${first}`);

        try {
            const resp = await axios.get(`/messages/${idRef.current}?offset=${offsetRef.current}`, { signal: controllerRef.current.signal });
            if (resp.status === 200) {
                if (id) {
                    if (first) {
                        dispatch({ type: 'set', messages: resp.data.messages });
                    } else {
                        dispatch({ type: 'addSet', messages: resp.data.messages });
                    }
                    offsetRef.current = offsetRef.current + 30;
                    hasMoreRef.current = resp.data.hasMore;
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        offsetRef.current = messages?.length ? messages?.length : 0;

        if(tempRef && id && messages != tempRef.current[id]) {
            tempRef.current[id] = {messages: messages, hasMore: hasMoreRef.current, offset: offsetRef.current};
        }
        console.log(tempRef.current);
    }, [messages]);

    useEffect(() => {
        controllerRef.current = new AbortController();

        if (id) {
            idRef.current = id;
            if (tempRef.current[id]) {
                dispatch({ type: 'set', messages: tempRef.current[id].messages });
                offsetRef.current = tempRef.current[id].offset;
                hasMoreRef.current = tempRef.current[id].hasMore;
                if (opened) {
                    toggle();
                }
            } else {
                dispatch({ type: 'set', messages: null });
                offsetRef.current = 0;
                hasMoreRef.current = false;
                if (opened) {
                    toggle();
                }
                loadMore(true);
            }
        } else {
            controllerRef.current.abort();
            dispatch({ type: 'set', messages: null });
            offsetRef.current = 0;
            hasMoreRef.current = false;
            if (opened) {
                toggle();
            }
        }

        return () => {
            controllerRef.current.abort();
            dispatch({ type: 'set', messages: null });
            offsetRef.current = 0;
            hasMoreRef.current = false;
            console.log('disconect');
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
                controllerRef.current.abort();
                navigate('/chat');
            }
        }
    }, [chats]);

    return (
        <MessagesContext.Provider value={{ messages, dispatch, hasMoreRef, loadMore, tempRef, idRef }}>
            {props.children}
        </MessagesContext.Provider>
    );
}

//начало редуктора:

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
