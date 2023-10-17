import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import router from './router';
import './css/index.css';
import '@mantine/core/styles.css';
import './css/chat.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MobileHeaderProvider } from './contexts/MobileHeaderContext';

// Main component
let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

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
				<MobileHeaderProvider>
					<Notifications />
					<RouterProvider router={router} />
				</MobileHeaderProvider>
			</MantineProvider>
		</AuthProvider>
	</React.StrictMode>
);