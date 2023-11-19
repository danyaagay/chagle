import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import routerConfig from './router';
import './css/index.css';
import '@mantine/core/styles.css';
import './css/chat.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter } from 'react-router-dom';

// Main component
let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const router = createBrowserRouter(routerConfig);

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
				<Notifications />
				<RouterProvider router={router} />
			</MantineProvider>
		</AuthProvider>
	</React.StrictMode>
);