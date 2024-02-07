import Admin from './pages/Admin';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Authentication from './pages/Authentication';
import ResetPassword from './pages/ResetPassword';
import Verify from './pages/Verify';
import GuestLayout from './layouts/GuestLayout';
import ContextLayout from './layouts/ContextLayout';

//Испорты инструментов
import Tool from './pages/Tool';
import Improve from './pages/Tools/Improve';
import Grammar from './pages/Tools/Grammar';

//Импорты роутера
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './css/index.css';
import '@mantine/core/styles.css';
import './css/chat.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter } from 'react-router-dom';
import {
	QueryClient,
	QueryClientProvider
} from '@tanstack/react-query';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Main component
let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		path: '/',
		element: <GuestLayout />,
		children: [
			{
				path: '/',
				element: <Authentication />,
			},
			{
				path: '/login',
				element: <Authentication />,
			},
			{
				path: '/signup',
				element: <Authentication />,
			},
			{
				path: '/reset-password/:token?',
				element: <ResetPassword />,
			}
		],
	},
	{
		path: '/',
		element: <ContextLayout />,
		children: [
			{
				path: '/chat/:id?',
				element: <Chat />,
			},
			{
				path: '/tool',
				element: <Tool />,
				children: [
					{
						path: 'improve',
						element: <Improve />,
					},
					{
						path: 'grammar',
						element: <Grammar />,
					},
				],
			},
			{
				path: '/settings',
				element: <Settings />,
			},
			{
				path: '/Crr183gJkwKQwkC3jE9N/:section?',
				element: <Admin />,
			},
		],
	},
	{
		path: '/verify/:status?',
		element: <Verify />,
	},
]);

root.render(
	<React.StrictMode>
		<AuthProvider>
			<MantineProvider
				theme={{
					fontSizes: {
						nm: '1rem',
					},
				}}
				classNamesPrefix='asdsda'
			>
				<QueryClientProvider client={queryClient}>
					<GoogleOAuthProvider clientId="390115146261-ulaoku99matl5ra8s1lqcba0b580eiv4.apps.googleusercontent.com">
						<Notifications />
						<RouterProvider router={router} />
					</GoogleOAuthProvider>
				</QueryClientProvider>
			</MantineProvider>
		</AuthProvider>
	</React.StrictMode>
);