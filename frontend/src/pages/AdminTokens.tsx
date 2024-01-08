import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from '../axios';
import {
	Group,
	Paper,
	Text,
	SimpleGrid,
	Box,
	Container,
} from '@mantine/core';
import { TokensList } from '../components/TokensList';
import { useQuery } from '@tanstack/react-query';
import classes from '../css/Admin.module.css';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';

type Stat = {
	title: string;
	value: string;
	diff?: number;
};

export default function StatsGridIcons() {
	const { user } = useAuth();

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

	const { data } = useQuery({
		queryKey: ['summary/tokens'],
		queryFn: () =>
			axios.get('/summary/tokens').then(
				(res) => res.data,
			),
	});

	const stats = data?.map((stat: Stat) => {
		return (
			<Paper withBorder p="md" radius="md" key={stat.title}>
				<Group justify="apart">
					<div>
						<Text c="dimmed" tt="uppercase" fw={700} fz="xs" className={classes.label}>
							{stat.title}
						</Text>
						<Text fw={700} fz="xl">
							{stat.value}
						</Text>
					</div>
				</Group>
			</Paper>
		);
	});

	return (
		<>
			{!IS_MOBILE ? (
				<Scrollbars
					autoHide
				>
					<div style={{ 'maxWidth': '1200px', 'margin': 'auto' }}>
						<SimpleGrid classNames={classes}>{stats}</SimpleGrid>
						<Box className={classes.root}>
							<TokensList />
						</Box>
					</div>
				</Scrollbars>

			) : (
				<Container className={classes.container} px={8}>
					<SimpleGrid classNames={classes}>{stats}</SimpleGrid>
					<Box className={classes.root}>
						<TokensList />
					</Box>
				</Container>
			)}
		</>
	);
}