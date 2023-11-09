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
import InfiniteBox2 from '../components/InfiniteBox2';
import InfiniteBoxMobile from '../components/InfiniteBoxMobile';
import InfiniteBoxMobile3 from '../components/InfiniteBoxMobile3';
import InfiniteBoxMobile2 from '../components/InfiniteBoxMobile2';
import InfiniteBoxDesktop from '../components/InfiniteBoxDesktop';
import InfiniteBoxDesktop2 from '../components/InfiniteBoxDesktop2';
import InfiniteBox4 from '../components/InfiniteBox4';

const MessageList = () => {
    const mobileScreen = useMediaQuery('(max-width: 767px)');

    return (
        <div className="bubbles">

                <InfiniteBoxMobile />
   
        </div>
    );
};

export default MessageList;