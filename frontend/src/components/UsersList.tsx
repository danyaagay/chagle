import { useState } from 'react';
import {
	Table,
	ScrollArea,
	UnstyledButton,
	Group,
	Text,
	Center,
	TextInput,
	ActionIcon,
	NumberInput,
	Flex,
	rem
} from '@mantine/core';
import axios from '../axios';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useStateRef from 'react-usestateref';

interface RowData {
	id: number;
	name: string;
	email: string;
	telegram_id: number;
	balance: number;
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

export function UsersList() {
	const [search, setSearch, searchRef] = useStateRef('');
	//const [data, setData] = useState<RowData[]>([]);
	const [sortedData, setSortedData] = useState<RowData[]>([]);
	const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);

	const [balances, setBalances] = useState([]);
	const handleBalanceChange = (index: number, value: any) => {
		const updatedBalances: any = [...balances];
		updatedBalances[index] = value;
		setBalances(updatedBalances);
	};

	const { data } = useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const res = await axios.get('/users');
			console.log(searchRef.current);
			if (searchRef.current) {
				setSortedData(sortData(res.data, { sortBy, reversed: reverseSortDirection, search: searchRef.current }));
			} else {
				setSortedData(res.data);
			}
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
		mutationFn: (id: number) => {
			return axios.post(`/balance/${id}`, { balance: balances[id] });
		},
		onSuccess: (_data, id: number) => {
			handleBalanceChange(id, '');

			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});

	return (
		<ScrollArea>
			<TextInput
				placeholder="Поиск по любым данным"
				mb="md"
				leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
				value={search}
				onChange={handleSearchChange}
				radius={'md'}
			/>
			<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" striped>
				<Table.Thead>
					<Table.Tr>
						<Th
							sorted={sortBy === 'name'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('name')}
						>
							Имя
						</Th>
						<Th
							sorted={sortBy === 'email'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('email')}
						>
							Email
						</Th>
						<Th
							sorted={sortBy === 'telegram_id'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('telegram_id')}
						>
							Telegram
						</Th>
						<Th
							sorted={sortBy === 'balance'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('balance')}
						>
							Баланс
						</Th>
						<Table.Th> 
							Пополнить
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{sortedData?.map((row) => (
						<Table.Tr key={row.id}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>{row.email}</Table.Td>
							<Table.Td>{row.telegram_id}</Table.Td>
							<Table.Td>{row.balance}</Table.Td>
							<Table.Td>
								<Flex gap="8">
									<NumberInput
										value={balances[row.id] ?? ''}
										onChange={(value) => handleBalanceChange(row.id, value)}
										min={1}
										radius={'md'}
									/>
									<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd(row.id)} radius={'md'}>
										<IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
									</ActionIcon>
								</Flex>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}