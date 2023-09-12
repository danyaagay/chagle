import { useRef, useEffect } from 'react';
import {
    createStyles,
	Header,
	Text,
	MediaQuery,
	Burger,
    useMantineTheme,
} from '@mantine/core';

import { useMobileTitle } from '../contexts/MobileTitleContext';

const useStyles = createStyles(() => ({
	headerBox: {
		display: 'flex',
		alignItems: 'center',
		height: '100%'
	},
}));

export default function MobileHeader({ opened, setOpened }: { opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>> }) {
    const topbarRef = useRef<HTMLInputElement>(null);
    const { mobileTitle } = useMobileTitle();
    const { classes } = useStyles();

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
        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
            <Header height={{ base: 60, md: 70 }} p="md" ref={topbarRef}>
                <div className={classes.headerBox}>
                    <Burger
                        opened={opened}
                        onClick={() => setOpened((o) => !o)}
                        size="sm"
                        color={theme.colors.gray[6]}
                        mr="xl"
                    />

                    <Text>{mobileTitle}</Text>
                </div>
            </Header>
        </MediaQuery>
	);
}