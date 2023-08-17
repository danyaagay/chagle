import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import router from './router';
import './index.css';
import {MantineProvider, createEmotionCache } from '@mantine/core';
  
  const myCache = createEmotionCache({
	key: 'ryerlaf',
	prepend: false
  });

let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<React.StrictMode>
		<AuthProvider>
			<MantineProvider emotionCache={myCache}>
				<RouterProvider router={router} />
			</MantineProvider>
		</AuthProvider>
	</React.StrictMode>
);