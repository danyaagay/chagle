import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import router from './router';
import './index.css';
import './chat.css';
import {MantineProvider, createEmotionCache } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// Main component
let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const myCache = createEmotionCache({
	key: 'ryerlaf',
	prepend: false
});

root.render(
	<React.StrictMode>
		<AuthProvider>
			<MantineProvider emotionCache={myCache}
			      theme={{
					fontSizes: {
					  nm: '1rem',
					},
				  }}>
					<Notifications />
					<RouterProvider router={router} />
			</MantineProvider>
		</AuthProvider>
	</React.StrictMode>
);