import { useEffect, useState, useRef } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	IconSettings,
	IconLogout,
	IconPlus,
} from '@tabler/icons-react';
import {
	createStyles,
	Navbar,
	getStylesRef,
	rem,
	AppShell,
	Button,
	Header,
	Text,
	MediaQuery,
	Burger,
	useMantineTheme,
	UnstyledButton
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MobileTitleContext from '../contexts/MobileTitleContext';
import { DialogsProvider } from '../contexts/DialogsContext';
import DialogsList from '../components/DialogsList';

const useStyles = createStyles((theme) => ({
	header: {
	  paddingBottom: theme.spacing.md,
	},

	headerBox: {
		display: 'flex',
		alignItems: 'center',
		height: '100%'
	},
  
	footer: {
	  paddingTop: theme.spacing.md,
	  marginTop: theme.spacing.md,
	  borderTop: `${rem(1)} solid ${
		theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
	  }`,
	},
  
	link: {
	  ...theme.fn.focusStyles(),
	  width: '100%',
	  display: 'flex',
	  alignItems: 'center',
	  textDecoration: 'none',
	  fontSize: theme.fontSizes.nm,
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
	  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
	  borderRadius: theme.radius.md,
	  cursor: 'pointer',
	  fontWeight: 400,
  
	  '&:hover': {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	  },
	},
  
	linkIcon: {
	  ref: getStylesRef('icon'),
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
	  marginRight: theme.spacing.sm,
	},
  
	linkActive: {
	  '&, &:hover': {
		backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
		color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
		},
	  },
	},
}));

export default function DefaultLayout() {
	const { user, setUser } = useAuth();
	const { classes } = useStyles();
	const [ mobileTitle, setMobileTitle ] = useState<string | false>(false);
	const navigate = useNavigate();
	const [ opened, setOpened ] = useState(false);
	const theme = useMantineTheme();
	const topbarRef = useRef<HTMLInputElement>(null);
	const mobileScreen = useMediaQuery('(max-width: 767px)');

	useEffect(() => {
		// Set mobile title when loading page first time
		const path = window.location.pathname;
		if (path === '/settings') {
			setMobileTitle('Настройки');
		} else if (path === '/chat') {
			setMobileTitle('Новый чат');
		} else {
			setMobileTitle(false);
		}
		
		// Check if user is logged in or not from server
		(async () => {
			try {
				const resp = await axios.get('/user', user);
				if (resp.status === 200) {
					setUser(resp.data.data);
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response && error.response.status === 401) {
					localStorage.removeItem('user');
					window.location.href = '/';
					console.log(error);
				}
			}
		})();
		
		// Disable scroll mobile
		function preventDefault(e: Event): void {
			e.preventDefault();
		}

		const wheelOpt: AddEventListenerOptions | boolean = 
			'onwheel' in document.createElement('div') ? { passive: false } : false;

		topbarRef.current?.addEventListener('touchmove', preventDefault, wheelOpt);
	}, [setMobileTitle]);

	// If user is not logged in, redirect to login page
	if (!user) {
		return <Navigate to="/" />;
	}

	// Logout user
	const handleLogout = async () => {
		try {
			const resp = await axios.post('/logout');
			if (resp.status === 200) {
				localStorage.removeItem('user');
				window.location.href = '/';
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<DialogsProvider>
		<MobileTitleContext.Provider value={{ mobileTitle, setMobileTitle }}>
		<AppShell
			styles={{
				main: {
					height: '100%',
					minHeight: '100%',
					paddingBottom: '0px',
					paddingTop: '60px',
					...(mobileScreen ? { paddingRight: '0px !important', paddingLeft: '0px !important' } : { paddingTop: '0px' }),
				},
				root: {
					height: '100%',
					minHeight: '100%',
				},
				body: {
					height: '100%',
					minHeight: '100%',
				}
			}}
			layout='alt'
			navbarOffsetBreakpoint="sm"
			asideOffsetBreakpoint="sm"
			navbar={
				<Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
					<MediaQuery largerThan="sm" styles={{ display: 'none' }}>
						<Burger
							opened={opened}
							onClick={() => setOpened((o) => !o)}
							size="sm"
							color={theme.colors.gray[6]}
							mb='16px'
						/>
					</MediaQuery>

					<Navbar.Section >
						<Button
							leftIcon={<IconPlus />}
							className={classes.link}
							variant="default"
							fullWidth
							size='lg'
							mb='16px'
							onClick={() => {
								setOpened((o) => !o);
								setMobileTitle('Новый чат');
								navigate('chat');
							}}
						>
							Новый чат
						</Button>
					</Navbar.Section>

					<Navbar.Section grow>
						<DialogsList />
					</Navbar.Section>

					<Navbar.Section className={classes.footer}>
						<NavLink
							to='settings'
							className={classes.link}
							onClick={() => {
								setOpened((o) => !o);
								setMobileTitle('Настройки');
							}}
						>
							<IconSettings className={classes.linkIcon} stroke={1.5} />
							<span>Настройки</span>
						</NavLink>

						<UnstyledButton className={classes.link} onClick={() => handleLogout()}>
							<IconLogout className={classes.linkIcon} stroke={1.5} />
							<span>Выйти</span>
						</UnstyledButton>
					</Navbar.Section>
				</Navbar>
			}
			header={
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
			}
	  	>
			<Outlet />
	  	</AppShell>
		</MobileTitleContext.Provider>
		</DialogsProvider>
	);
}