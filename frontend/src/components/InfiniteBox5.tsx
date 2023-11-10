import { useContext, useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import useStateRef from 'react-usestateref'
import {IS_OVERLAY_SCROLL_SUPPORTED} from '../environment/overlayScrollSupport';
import { ChatFeed } from 'react-bell-chat'


const InfiniteBox5 = () => {
    const { id } = useParams();
    const Chat = useRef<any>();
    const state = useRef<any>({messages: []});

    const [{ authors, messages, messageText }, setState] =
    useState<any>({
      messages: [
        {
          id: 0,
          authorId: 1,
          message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
        },
        {
          id: 1,
          authorId: 1,
          message: 'Hey! Evan here. react-bell-chat is pretty dooope.',
        },
        {
          id: 2,
          authorId: 1,
          message: 'Rly is.',
        },
        {
          id: 3,
          authorId: 1,
          message: 'Long group.',
        },
        {
          id: 4,
          authorId: 0,
          message: 'My message.',
        },
        {
          id: 5,
          authorId: 0,
          message: 'One more.',
        },
        {
          id: 6,
          authorId: 1,
          message: 'One more group to see the scroll.',
        },
        {
          id: 7,
          authorId: 1,
          message: 'I said group.',
        },
      ],
      messageText: '',
    });

    const onLoadOldMessages = useCallback(
        () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              setState((previousState) => ({
                ...previousState,
                messages: new Array(10)
                  .fill(1)
                  .map(
                    (e, i) =>
                      ({
                        id: Number(new Date()),
                        message: 'Old message ' + (i + 1).toString(),
                        authorId: Math.round(Math.random()),
                      })
                  )
                  .concat(previousState.messages),
              }));
              resolve();
            }, 500)
          ),
        []
    );

    return (

        <ChatFeed
            hasOldMessages={true}
            onLoadOldMessages={onLoadOldMessages}
            loadOldMessagesThreshold={200}
            style={{
                height: 300
            }}
            messages={messages}
            authors={authors}
            yourAuthorId={0}
            ref={Chat}
        />

    );
};

export default InfiniteBox5;