import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	AppShell,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MobileTitleProvider } from '../contexts/MobileTitleContext';
import { ChatsProvider } from '../contexts/ChatsContext';
import MobileHeader from '../components/MobileHeader';
import Menu from '../components/Menu';
import classes from '../css/ProtectedLayout.module.css';


export default function DefaultLayout() {
	const { user, setUser } = useAuth();
	const [opened, setOpened] = useState(false);

	const mobileScreen = useMediaQuery('(max-width: 767px)');

	useEffect(() => {
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
	}, []);

	// If user is not logged in, redirect to login page
	if (!user) {
		return <Navigate to="/" />;
	}

	// If user is not verify email, redirect to verify page
	if (!user.email_verified_at) {
		return <Navigate to="/verify" />;
	}

	return (
		<MobileTitleProvider>
			<ChatsProvider>
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
					}}
					layout='alt'
					header={{ height: { base: 60, md: 70 } }}
					navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
				>
					<AppShell.Header hiddenFrom="sm" className={classes.header} p="md">
						<MobileHeader opened={opened} setOpened={setOpened} />
					</AppShell.Header>

					<AppShell.Navbar className={classes.navbar}>
						<Menu opened={opened} setOpened={setOpened} />
					</AppShell.Navbar>

					<AppShell.Main>
						<Outlet />
					</AppShell.Main>
				</AppShell>
			</ChatsProvider>
		</MobileTitleProvider>
	);
}