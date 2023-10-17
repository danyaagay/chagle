import { createContext, useEffect, useReducer, useState, ReactNode, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import ChatsContext from '../contexts/ChatsContext';
import MobileHeaderContext from '../contexts/MobileHeaderContext';

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
    tempIdRef: React.MutableRefObject<string>;
};

const MessagesContext = createContext<MessagesContextProps>({
    messages: null,
    dispatch: () => {},
    tempIdRef: { current: "" },
});

type MessagesProviderProps = {
  children: ReactNode;
};

type MessagesTempState = {
    [id: string]: Message[];
};

function MessagesProvider(props: MessagesProviderProps) {
    const { chats } = useContext(ChatsContext);
    const [ messages, dispatch ] = useReducer(messagesReducer, []);
    const [ messagesTemp, setMessagesTemp ] = useState<MessagesTempState>({});
    const tempIdRef = useRef('');
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const { opened, toggle } = useContext(MobileHeaderContext);

    const controller = new AbortController();

    const fetchData = async () => {
        try {
            const resp = await axios.get(`/messages/${id}`, { signal: controller.signal });
            if (resp.status === 200) {
                if (id) {
                    dispatch({type: 'set', messages: resp.data.messages});
                    setMessagesTemp(prevMessages => ({
                        ...prevMessages,
                        [id]: resp.data.messages,
                    }));
                }
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                navigate('/chat');
                console.log(error);
            }
        }
    };

    useEffect(() => {
        if (id) {
            if (messages != messagesTemp[id]) {
                setMessagesTemp(prevMessages => ({
                    ...prevMessages,
                    [id]: messages,
                }));
            }
        }
    }, [messages]);
        
    useEffect(() => {
        tempIdRef.current = '';

        if (id) {
            if (messagesTemp[id]) {
                dispatch({type: 'set', messages: messagesTemp[id]});
                if (opened) {
                    toggle();
                }
            } else {
                dispatch({type: 'set', messages: null});
                if (opened) {
                    toggle();
                }
                fetchData();
            }
        } else {
            controller.abort();
            dispatch({type: 'set', messages: null});
            if (opened) {
                toggle();
            }
        }
    }, [location]);

    useEffect(() => {
        if (chats && chats.length > 0 && id) {
            const chatExists = chats.some(chat => chat.id == id);
            if (chatExists) {
                fetchData();
            } else {
                navigate('/chat');
            }
        }
    }, [chats]);

  return (
    <MessagesContext.Provider value={{ messages, dispatch, tempIdRef }}>
      {props.children}
    </MessagesContext.Provider>
  );
}

type Action =
  | { type: 'set', messages:  Message[] | null }
  | { type: 'add', message: { id: number, text: string, you: boolean } }
  | { type: 'change', id: number, message: { id?: number; date?: string; text?: string; marker?: string; time?: string; you?: boolean; } }
  | { type: 'delete', id: number };

function messagesReducer(messages: Message[], action: Action): Message[] {
  switch (action.type) {
    case 'set':
        return action.messages || [];
    case 'add':
        const date = new Date();
        const dateFormatted = date.toISOString();

        const timeString = dateFormatted.split('T')[1].slice(0, 5);
        let [hours, minutes] = timeString.split(':');
        hours = parseInt(hours).toString();

        let marker;
        
        //if (messages && messages.length > 0) {
             const lastMessageWithMarker = messages.filter(message => message.marker)[messages.filter(message => message.marker).length - 1];
        
             if (lastMessageWithMarker && lastMessageWithMarker.marker != 'Сегодня' || !lastMessageWithMarker) {
                 marker = 'Сегодня';
             }
        //}
        
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
