import { useState } from 'react';
import {
	Table,
	ScrollArea,
	UnstyledButton,
	Group,
	Text,
	Center,
	TextInput,
	rem,
	Box,
	ActionIcon,
	Badge,
} from '@mantine/core';
import axios from '../axios';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RowData {
	id: number;
	token: string;
	limit: number;
	status: string;
}

interface ThProps {
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
	const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
	return (
		<Table.Th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group justify="space-between">
					<Text fw={500} fz="sm">
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
					</Center>
				</Group>
			</UnstyledButton>
		</Table.Th>
	);
}

function filterData(data: RowData[], search: string): RowData[] {
	const query = search.toLowerCase().trim();

	if (data.length === 0) {
		return [];
	}

	const keys: (keyof RowData)[] = Object.keys(data[0]) as (keyof RowData)[];

	return data.filter((item) =>
		keys.some((key) => {
			const value = item[key];
			return typeof value === "string" && value.toLowerCase().includes(query);
		})
	);
}

function sortData(
	data: RowData[],
	payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }
) {
	const { sortBy, reversed, search } = payload;

	if (!sortBy) {
		return filterData(data, search);
	}

	const sortedData = [...data].sort((a, b) => {
		const valueA = a[sortBy];
		const valueB = b[sortBy];

		if (typeof valueA === 'string' && typeof valueB === 'string') {
			return reversed ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
		} else if (typeof valueA === 'number' && typeof valueB === 'number') {
			return reversed ? valueB - valueA : valueA - valueB;
		}

		return 0;
	});

	return filterData(sortedData, search);
}

export function TokensList() {
	const [search, setSearch] = useState('');
	//const [data, setData] = useState<RowData[]>([]);
	const [sortedData, setSortedData] = useState<RowData[]>([]);
	const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);

	const [token, setToken] = useState('');

	const { data } = useQuery({
		queryKey: ['tokens'],
		queryFn: async () => {
			const res = await axios.get('/tokens');
			setSortedData(res.data);
			return res.data;
		}
	});

	const setSorting = (field: keyof RowData) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(data, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
	};


	const queryClient = useQueryClient();

	const { mutate: mutationAdd } = useMutation({
		mutationFn: () => {
			return axios.post(`/tokens`, { token: token });
		},
		onSuccess: () => {
			//setSortedData((prevTokens) => [...prevTokens, resp.data]);
			setToken('');

			queryClient.invalidateQueries({ queryKey: ['tokens'] });
			queryClient.invalidateQueries({ queryKey: ['summary/tokens'] });
		},
	});

	const { mutate: mutationRemove } = useMutation({
		mutationFn: (id: number) => {
			return axios.delete(`/tokens/${id}`);
		},
		onSuccess: () => {
			//setSortedData((prevTokens) =>
			//	prevTokens.filter((token) => token.id !== id)
			//);

			queryClient.invalidateQueries({ queryKey: ['tokens'] });
			queryClient.invalidateQueries({ queryKey: ['summary/tokens'] });
		},
	});

	return (
		<ScrollArea>
			<Box mb="md">
				<Group gap={8} justify="flex-end">
					<TextInput
						placeholder="Токен"
						rightSectionPointerEvents="all"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						radius={'md'}
					/>
					<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd()} radius={'md'}>
						<IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
					</ActionIcon>
				</Group>
			</Box>
			<TextInput
				placeholder="Поиск по любым данным"
				mb="md"
				leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
				value={search}
				onChange={handleSearchChange}
				radius={'md'}
			/>
			<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" miw={900} striped>
				<Table.Thead>
					<Table.Tr>
						<Th
							sorted={sortBy === 'id'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('id')}
						>
							Id
						</Th>
						<Th
							sorted={sortBy === 'token'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('token')}
						>
							Токен
						</Th>
						<Th
							sorted={sortBy === 'limit'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('limit')}
						>
							Лимит
						</Th>
						<Th
							sorted={sortBy === 'status'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('status')}
						>
							Статус
						</Th>
						<Table.Th />
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{sortedData && sortedData.map((row) => (
						<Table.Tr key={row.id}>
							<Table.Td>{row.id}</Table.Td>
							<Table.Td>{row.token}</Table.Td>
							<Table.Td>{row.limit}</Table.Td>
							<Table.Td>
								{row.status == '1' && (
									<Badge fullWidth variant="light">
										Работает
									</Badge>
								)}

								{row.status == '2' && (
									<Badge fullWidth variant="light" color="yellow">
										Приостановлен
									</Badge>
								)}

								{row.status == '3' && (
									<Badge fullWidth variant="light" color="red">
										Истек
									</Badge>
								)}
							</Table.Td>
							<Table.Td>
								<Group gap={0} justify="flex-end">
									<ActionIcon variant="subtle" color="red" onClick={() => mutationRemove(row.id)}>
										<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
									</ActionIcon>
								</Group>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}