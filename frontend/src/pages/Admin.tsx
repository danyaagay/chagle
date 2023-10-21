import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useContext } from 'react';
import {  Navigate } from 'react-router-dom';
import axios from '../axios';
import {
	Group,
	Paper,
	Text,
	ThemeIcon,
	SimpleGrid,
	Tabs,
	TextInput,
	ActionIcon,
	Button,
	Box
} from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { TableList } from '../components/TableList';
import MobileHeaderContext from '../contexts/MobileHeaderContext';
import { IconPlus } from '@tabler/icons-react';

import classes from '../css/Admin.module.css';

type Stat = {
	title: string;
	value: string;
	diff?: number;
};

export default function StatsGridIcons() {
	const { user } = useAuth();
	const [ data, setData] = useState<Stat[]>([]);
	const [ users, setUsers ] = useState([]);
	const [ tokens, setTokens ] = useState([]);
	const { opened, toggle } = useContext(MobileHeaderContext);
	const [ token, setToken] = useState("");

	useEffect(() => {
		if (data.length > 0 && opened) {
			toggle();
		}
	}, [data]);

	useEffect(() => {
		(async () => {
			try {
				const resp = await axios.get('/Crr183gJkwKQwkC3jE9N', user);
				if (resp.status === 200) {
					setData(resp.data);
				}
				const users = await axios.get('/users', user);
				if (users.status === 200) {
					setUsers(users.data);
				}
				const tokens = await axios.get('/tokens', user);
				if (tokens.status === 200) {
					setTokens(tokens.data);
				}
			} catch (error: unknown) {
				
			}
		})();
	}, []);

	// If user not super-admin, redirect to chat page
	if (user.roles[0] != 'super-admin') {
		return <Navigate to="/" />;
	}

	const handleTokenAdd = async () => {
		try {
			const resp = await axios.post(`/tokens`, { token: token });
			console.log(resp);
			if (resp.status === 200) {
				setTokens((prevTokens) => [...prevTokens, {id: resp.data.id, created_at: resp.data.created_at, updated_at: resp.data.updated_at, token: resp.data.token, alive: resp.data.alive}]);
			}
		} catch (error: unknown) {

		}
	};

	const handleTokenChange = (event) => {
		setToken(event.target.value);
	};

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

				<Tabs.Panel value="users" pt="xl">
					<TableList data={users} />
				</Tabs.Panel>

				<Tabs.Panel value="tokens" pt="xl">
					<Box mb="lg">
						<Group gap={8}>
							<TextInput
								placeholder="Токен"
								rightSectionPointerEvents="all"
								w={500}
								onChange={handleTokenChange}
							/>
							<ActionIcon variant="filled" size="lg" w={36} h={36} onClick={handleTokenAdd}>
								<IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
							</ActionIcon>
						</Group>
					</Box>
					<TableList data={tokens} />
				</Tabs.Panel>
			</Tabs>
		</>
	);
}