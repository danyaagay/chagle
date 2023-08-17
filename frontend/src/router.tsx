import { createBrowserRouter } from 'react-router-dom';
import About from './pages/About';
import Profile from './pages/Profile';
import Authentication from './pages/Authentication';
import ResetPassword from './pages/ResetPassword';
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
			},
		],
	},
	{
		path: '/',
		element: <ProtectedLayout />,
		children: [
			{
				path: '/about',
				element: <About />,
			},
			{
				path: '/profile',
				element: <Profile />,
			},
		],
	},
]);

export default router;