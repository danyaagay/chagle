import { createBrowserRouter } from 'react-router-dom';
import About from './pages/About';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import ProtectedLayout from './components/ProtectedLayout';
import GuestLayout from './components/GuestLayout';

const router = createBrowserRouter([
	{
		path: '/',
		element: <GuestLayout />,
		children: [
			{
				path: '/',
				element: <Auth />,
			},
			{
				path: '/login',
				element: <Auth />,
			},
			{
				path: '/register',
				element: <Auth />,
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