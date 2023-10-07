import { useRef, useEffect } from 'react';
import {
    Text,
    Burger,
    useMantineTheme,
} from '@mantine/core';
import { useMobileTitle } from '../contexts/MobileTitleContext';
import classes from '../css/MobileHeader.module.css';

export default function MobileHeader({ opened, setOpened }: { opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>> }) {
    const topbarRef = useRef<HTMLInputElement>(null);
    const { mobileTitle } = useMobileTitle();

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
        <>
            <div className={classes.headerBox} ref={topbarRef}>
                <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                />
                <Text>{mobileTitle}</Text>
            </div>
        </>
    );
}