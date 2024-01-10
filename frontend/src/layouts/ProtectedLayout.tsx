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
	ActionIcon,
} from '@mantine/core';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import MobileHeader from '../components/MobileHeader';
import Menu from '../components/Menu';
import ChatSettings from '../components/ChatSettings';
import classes from '../css/ProtectedLayout.module.css';
import { useLoading } from '../contexts/LoadingContext';
import { useParams } from 'react-router-dom';
import {
	IconSettings
} from '@tabler/icons-react';


export default function DefaultLayout() {
	const { user, setUser } = useAuth();
	const { opened, openedSettings, toggleSettings } = useMobileHeader();
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
				aside={{ width: 300, breakpoint: 'sm', collapsed: { desktop: id ? !openedSettings : true, mobile: id ? !openedSettings : true } }}
				transitionDuration={0}
			>
				<AppShell.Header hiddenFrom="sm" p="sm">
					<MobileHeader />
				</AppShell.Header>

				<AppShell.Navbar p="sm" style={{ height: "100%" }}>
					<Menu />
				</AppShell.Navbar>

				<AppShell.Main>
					{id &&
						<div
							style={{
								display: 'block',
								position: 'fixed',
								right: '16px',
								top: '12px',
								zIndex: '2',
							}}
						>
							<ActionIcon
								style={{ marginLeft: 'auto', borderColor: '#ced4da' }}
								variant="outline"
								size="md"
								radius="md"
								color="rgba(0, 0, 0, 1)"
								aria-label="Settings"
								onClick={toggleSettings}
								mih={45}
								miw={45}
							>
								<IconSettings style={{ width: 24, height: 24 }} stroke={1.5} />
							</ActionIcon>
						</div>
					}
					<Outlet />
				</AppShell.Main>

				<AppShell.Aside p="sm">
					{id && <ChatSettings />}
				</AppShell.Aside>
			</AppShell>
		</>
	);
}