import { useRef, useEffect } from 'react';
import {
    Burger,
    useMantineTheme,
} from '@mantine/core';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/MobileHeader.module.css';

export default function MobileHeader() {
    const topbarRef = useRef<HTMLInputElement>(null);
    const { mobileTitle, opened, toggle } = useMobileHeader();

    const theme = useMantineTheme();

    useEffect(() => {
        // Disable scroll mobile
        function preventDefault(e: Event): void {
            e.preventDefault();
        }

        const wheelOpt: AddEventListenerOptions | boolean =
            'onwheel' in document.createElement('div') ? { passive: false } : false;

        topbarRef.current?.addEventListener('touchmove', preventDefault, wheelOpt);
    }, []);

    return (
        <div className={classes.headerBox} ref={topbarRef}>
            <div className='burgerBox'>
                <button onClick={toggle} className='burgerButton'></button>
                <div
                    className='burger'
                />
            </div>
            <span className={classes.text}>{mobileTitle}</span>
        </div>
    );
}