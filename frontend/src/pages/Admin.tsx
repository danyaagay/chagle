import { useAuth } from '../contexts/AuthContext';
import { Navigate, useParams } from 'react-router-dom';
import axios from '../axios';
import {
	Group,
	Paper,
	Text,
	SimpleGrid,
	Container,
	Box,
} from '@mantine/core';
import classes from '../css/Admin.module.css';
import { useQuery } from '@tanstack/react-query';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';
import { TokensList } from '../components/TokensList';
import { UsersList } from '../components/UsersList';
import { ProxyList } from '../components/ProxyList';

type Stat = {
	title: string;
	value: string;
};

export default function StatsGridIcons() {
	const { user } = useAuth();
	const { section } = useParams();

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

	const { data } = useQuery({
		queryKey: [`summary/${section ? section : 'all'}`],
		queryFn: () =>
			axios.get(`/summary/${section ? section : 'all'}`).then(
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
				<Scrollbars autoHide>
					<div style={{ 'maxWidth': '1200px', 'margin': 'auto' }}>
						<SimpleGrid cols={{ base: 1, sm: !section || section === 'proxy' ? 3 : section === 'tokens' ? 1 : 2 }} classNames={classes}>{stats}</SimpleGrid>
						{section === 'tokens' &&
							<Box className={classes.root}>
								<TokensList />
							</Box>
						}
						{section === 'users' &&
							<Box className={classes.root}>
								<UsersList />
							</Box>
						}
						{section === 'proxy' &&
							<Box className={classes.root}>
								<ProxyList />
							</Box>
						}
					</div>
				</Scrollbars>

			) : (
				<Container className={classes.container} px={8}>
					<SimpleGrid cols={{ base: 1, sm: !section || section === 'proxy' ? 3 : section === 'tokens' ? 1 : 2 }} classNames={classes}>{stats}</SimpleGrid>
					{section === 'tokens' &&
						<Box className={classes.root}>
							<TokensList />
						</Box>
					}
					{section === 'users' &&
						<Box className={classes.root}>
							<UsersList />
						</Box>
					}
					{section === 'proxy' &&
						<Box className={classes.root}>
							<ProxyList />
						</Box>
					}
				</Container>
			)}
		</>
	);
}