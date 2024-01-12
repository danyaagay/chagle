import { useRef, useEffect } from 'react';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/MobileHeader.module.css';
import {
    ActionIcon,
} from '@mantine/core';
import {
    IconSettings
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

export default function MobileHeader() {
    const topbarRef = useRef<HTMLInputElement>(null);
    const { mobileTitle, toggle, toggleSettings } = useMobileHeader();
    const { id } = useParams();

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
            {id ?
                <>
                    <ActionIcon
                        variant="transparent"
                        size="md"
                        radius="md"
                        color="#868e96"
                        aria-label="Settings"
                        onClick={toggleSettings}
                        mih={40}
                        miw={40}
                    >
                        <IconSettings style={{ width: 28, height: 28 }} stroke={1.7} />
                    </ActionIcon>
                    <span className={classes.text}>{mobileTitle}</span>
                </>
                :
                <span className={classes.text} style={{ textAlign: 'left', marginLeft: '12px'}}>{mobileTitle}</span>
            }
            <div className='burgerBox'>
                <button onClick={toggle} className='burgerButton'></button>
                <div
                    className='burger'
                />
            </div>
        </div>
    );
}