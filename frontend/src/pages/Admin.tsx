import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from '../axios';
import {
	Group,
	Paper,
	Text,
	SimpleGrid,
	Container,
} from '@mantine/core';
import classes from '../css/Admin.module.css';
import { useQuery } from '@tanstack/react-query';

type Stat = {
	title: string;
	value: string;
};

export default function StatsGridIcons() {
	const { user } = useAuth();

	const { data } = useQuery({
		queryKey: ['summary/all'],
		queryFn: () =>
			axios.get('/summary/all').then(
				(res) => res.data,
			),
	});

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

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
		<Container className={classes.container} px={8}>
			<SimpleGrid cols={{ base: 1, sm: 3 }} classNames={classes}>{stats}</SimpleGrid>
		</Container>
	);
}