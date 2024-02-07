import { Outlet, useLocation } from 'react-router-dom';

export default function Tool() {
	const location = useLocation();

	return (
		(location.pathname == '/tool' ?
			<div className='container'>
				История
			</div>
			:
			<Outlet />
		)

	);
}