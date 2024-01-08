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
import { UsersList } from '../components/UsersList';
import { useQuery } from '@tanstack/react-query';
import classes from '../css/Admin.module.css';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';

type Stat = {
	title: string;
	value: string;
};

export default function StatsGridIcons() {
	const { user } = useAuth();

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

	const { data } = useQuery({
		queryKey: ['summary/users'],
		queryFn: () =>
			axios.get('/summary/users').then(
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
						<SimpleGrid cols={{ base: 1, sm: 2 }} classNames={classes}>{stats}</SimpleGrid>
						<Box className={classes.root}>
							<UsersList />
						</Box>
					</div>
				</Scrollbars>

			) : (
				<Container className={classes.container} px={8}>
					<SimpleGrid cols={{ base: 1, sm: 2 }} classNames={classes}>{stats}</SimpleGrid>
					<Box className={classes.root}>
						<UsersList />
					</Box>
				</Container>
			)}
		</>
	);
}