import { useRef, useEffect } from 'react';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/MobileHeader.module.css';
import {
    ActionIcon, Center,
} from '@mantine/core';
import {
    IconSettings,
    IconChevronLeft
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function MobileHeader() {
    const topbarRef = useRef<HTMLInputElement>(null);
    const { mobileTitle, toggle, toggleSettings } = useMobileHeader();
    const { id } = useParams();
    const navigate = useNavigate();

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
            <ActionIcon
                variant="transparent"
                size="md"
                color="#868e96"
                onClick={() => {
                    toggle();
                    navigate('/chat');
                }}
                mih={57}
                miw={40}
            >
                <IconChevronLeft style={{ width: 30, height: 30 }} stroke={1.7} />
            </ActionIcon>
            {id ?
                <>
                    <span className={classes.text}>{mobileTitle}</span>
                    <ActionIcon
                        variant="transparent"
                        size="md"
                        color="#868e96"
                        aria-label="Settings"
                        onClick={toggleSettings}
                        mih={57}
                        miw={40}
                    >
                        <IconSettings style={{ width: 28, height: 28 }} stroke={1.7} />
                    </ActionIcon>
                </>
                :
                <span style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: '-1'
                }}>{mobileTitle}</span>
            }
        </div>
    );
}