import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useContext } from 'react';
import {  Navigate, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { Group, Paper, Text, ThemeIcon, SimpleGrid, Tabs, rem } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import MobileHeaderContext from '../contexts/MobileHeaderContext';

import classes from '../css/Admin.module.css';

type Stat = {
	title: string;
	value: string;
	diff?: number;
};

export default function StatsGridIcons() {
	const { user } = useAuth();
	const [ data, setData] = useState<Stat[]>([]);
	const { opened, toggle } = useContext(MobileHeaderContext);

	useEffect(() => {
		if (data.length > 0 && opened) {
			toggle();
		}
	}, [data]);

	useEffect(() => {
		// Check if user is logged in or not from server
		(async () => {
			try {
				const resp = await axios.get('/Crr183gJkwKQwkC3jE9N', user);
				if (resp.status === 200) {
					setData(resp.data);
				}
			} catch (error: unknown) {
				
			}
		})();
	}, []);

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

	const stats = data.map((stat: Stat) => {
		const DiffIcon = stat.diff && stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

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
					{stat.diff && (
						<ThemeIcon
							color="gray"
							variant="light"
							style={{
								color: stat.diff > 0 ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-red-6)',
							}}
							size={38}
							radius="md"
						>
							<DiffIcon size="1.8rem" stroke={1.5} />
						</ThemeIcon>
					)}
				</Group>
				{stat.diff && (
					<Text c="dimmed" fz="sm" mt="md">
						<Text component="span" c={stat.diff > 0 ? 'teal' : 'red'} fw={700}>
							{stat.diff}%
						</Text>{' '}
						{stat.diff > 0 ? 'increase' : 'decrease'} compared to last month
					</Text>
				)}
			</Paper>
		);
	});

	return (
		<>
			<SimpleGrid cols={{ base: 1, sm: 3 }} classNames={classes}>{stats}</SimpleGrid>
			<Tabs variant="unstyled" defaultValue="users" classNames={classes}>
				<Tabs.List grow>
					<Tabs.Tab
						value="users"
					>
						Клиенты
					</Tabs.Tab>
					<Tabs.Tab
						value="tokens"
					>
						Токены
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="gallery" pt="xs">
					Список клиентов
				</Tabs.Panel>

				<Tabs.Panel value="messages" pt="xs">
					Список токенов
				</Tabs.Panel>
			</Tabs>
		</>
	);
}