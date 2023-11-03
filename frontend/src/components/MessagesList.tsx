import { useContext, useEffect, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import Message from '../components/Message';
import MessagesContext from '../contexts/MessagesContext';
import { Scrollbars } from 'react-custom-scrollbars';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import InfiniteScroll from 'react-infinite-scroll-component';
import InfiniteBoxMobile from '../components/InfiniteBoxMobile';
import InfiniteBoxDesktop from '../components/InfiniteBoxDesktop';

const MessageList = () => {
    const mobileScreen = useMediaQuery('(max-width: 767px)');

    return (
        <div className="bubbles">
            {mobileScreen ? (
                <InfiniteBoxMobile />
            ) : (
                <InfiniteBoxDesktop />
            )}
        </div>
    );
};

export default MessageList;