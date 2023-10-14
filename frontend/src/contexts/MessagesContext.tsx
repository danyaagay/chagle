import { createContext, useEffect, useReducer, useState, ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';

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
    loading: boolean;
};

const MessagesContext = createContext<MessagesContextProps>({
    messages: null,
    dispatch: () => {},
    loading: false,
});

type MessagesProviderProps = {
  children: ReactNode;
};

type MessagesTempState = {
    [id: string]: Message[];
};

function MessagesProvider(props: MessagesProviderProps) {
    const [ messages, dispatch ] = useReducer(messagesReducer, []);
    const [ messagesTemp, setMessagesTemp ] = useState<MessagesTempState>({});
    const [ loading, setLoading ] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const controller = new AbortController();

    const fetchData = async () => {
        try {
            setLoading(true);
            const resp = await axios.get(`/messages/${id}`, { signal: controller.signal });
            console.log(resp);
            if (resp.status === 200) {
                if (id) {
                    dispatch({type: 'set', messages: resp.data.messages});
                    setMessagesTemp(prevMessages => ({
                        ...prevMessages,
                        [id]: resp.data.messages,
                    }));
                }
                setLoading(false);
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
        if (id) {
            if (messagesTemp[id]) {
                console.log(messagesTemp[id]);
                dispatch({type: 'set', messages: messagesTemp[id]});
                return;
            }

            fetchData();
        } else {
            controller.abort();
            setLoading(false);
            dispatch({type: 'set', messages: null});
        }
    }, [location]);

  return (
    <MessagesContext.Provider value={{ messages, dispatch, loading }}>
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
