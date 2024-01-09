import { useEffect } from 'react';
import {
	Navigate,
	Outlet
} from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	AppShell,
} from '@mantine/core';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import MobileHeader from '../components/MobileHeader';
import Menu from '../components/Menu';
import ChatSettings from '../components/ChatSettings';
import classes from '../css/ProtectedLayout.module.css';
import { useLoading } from '../contexts/LoadingContext';

import { useParams } from 'react-router-dom';


export default function DefaultLayout() {
	const { user, setUser } = useAuth();
	const { opened } = useMobileHeader();
	const { loading } = useLoading();
	
	const { id } = useParams();

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
		<>
			<AppShell
				style={{ visibility: !loading ? "visible" : "hidden" }}
				classNames={classes}
				layout='alt'
				navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
				aside={{ width: 300, breakpoint: 'sm', collapsed: { desktop: id ? false : true, mobile: id ? false : true } }}
				transitionDuration={0}
			>
				<AppShell.Header hiddenFrom="sm" p="sm">
					<MobileHeader />
				</AppShell.Header>

				<AppShell.Navbar p="sm" style={{ height: "100%" }}>
					<Menu />
				</AppShell.Navbar>

				<AppShell.Main>
					<Outlet />
				</AppShell.Main>

				<AppShell.Aside p="md">
					{id && <ChatSettings />}
				</AppShell.Aside>
			</AppShell>
		</>
	);
}