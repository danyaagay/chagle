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
import { DialogsProvider } from '../contexts/DialogsContext';
import MobileHeader from '../components/MobileHeader';
import Menu from '../components/Menu';


export default function DefaultLayout() {
	const { user, setUser } = useAuth();
	const [ opened, setOpened ] = useState(false);

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

	return (
		<MobileTitleProvider>
		<DialogsProvider>
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
				<Menu opened={opened} setOpened={setOpened} />
			}
			header={
				<MobileHeader opened={opened} setOpened={setOpened} />
			}
	  	>
			<Outlet />
	  	</AppShell>
		</DialogsProvider>
		</MobileTitleProvider>
	);
}