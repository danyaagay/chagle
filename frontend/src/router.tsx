import { createBrowserRouter } from 'react-router-dom';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Authentication from './pages/Authentication';
import ResetPassword from './pages/ResetPassword';
import Verify from './pages/Verify';
import ProtectedLayout from './layouts/ProtectedLayout';
import GuestLayout from './layouts/GuestLayout';

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
		element: <ProtectedLayout />,
		children: [
			{
				path: '/chat/:id?',
				element: <Chat />,
			},
			{
				path: '/settings',
				element: <Settings />,
			},
		],
	},
	{
		path: '/verify/:status?',
		element: <Verify />,
	},
]);

export default router;