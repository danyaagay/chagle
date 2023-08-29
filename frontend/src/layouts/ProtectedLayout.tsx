import React, { useEffect, useState, useRef } from 'react';
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
import ChatDialogButton from '../components/ChatDialogButton';

const useStyles = createStyles((theme) => ({
	header: {
	  paddingBottom: theme.spacing.md,
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
	const [activeChat, setActiveChat] = useState<{ id: number; title: string } | false>(false);
	const [dialogs, setDialogs] = useState<Array<{ id: number, title: string }> | null>(null);
	const navigate = useNavigate();

	const [opened, setOpened] = useState(false);
	const theme = useMantineTheme();
	const topbarRef = useRef<HTMLInputElement>(null);
	const mobileScreen = useMediaQuery('(max-width: 767px)');

	useEffect(() => {
		(async () => {
			// Check if user is logged in or not from server
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

			// Get all dialogs
			try {
				const resp = await axios.get('/dialogs');
				console.log(resp);
				if (resp.status === 200) {
					setDialogs(resp.data.dialogs);
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
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
	}, []);

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

	//console.log(activeChat);

	return (
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
								setActiveChat(false);
								navigate('chat');
							}}
						>
							Новый чат
						</Button>
					</Navbar.Section>

					<Navbar.Section grow>
						{dialogs && dialogs.map((dialog: any) => (
							<ChatDialogButton
								key={dialog.id}
								title={dialog.title}
								active={activeChat && activeChat.id == dialog.id ? true : false}
								onClick={() => {
									setOpened((o) => !o);
									setActiveChat(dialog);
									navigate('chat/'+dialog.id);
								}}
							/>
						))}
					</Navbar.Section>

					<Navbar.Section className={classes.footer}>
						<NavLink
							to='settings'
							className={classes.link}
							onClick={() => {
								setOpened((o) => !o);
								setActiveChat(false);
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
						<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
							<Burger
								opened={opened}
								onClick={() => setOpened((o) => !o)}
								size="sm"
								color={theme.colors.gray[6]}
								mr="xl"
							/>
			
							<Text>{activeChat && activeChat.title}</Text>
						</div>
					</Header>
				</MediaQuery>
			}
	  	>
			<Outlet />
	  	</AppShell>
	);
}