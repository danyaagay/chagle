import { useState } from 'react';
import {
	Table,
	ScrollArea,
	UnstyledButton,
	Group,
	Text,
	Center,
	TextInput,
	rem
} from '@mantine/core';
import axios from '../axios';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';
import { useQuery } from '@tanstack/react-query';

interface RowData {
	id: number;
	name: string;
	email: string;
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
	const [search, setSearch] = useState('');
	//const [data, setData] = useState<RowData[]>([]);
	const [sortedData, setSortedData] = useState<RowData[]>([]);
	const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);
	
	const { data } = useQuery({
		queryKey: ['users'],
		queryFn: async () => {
			const res = await axios.get('/users');
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

	return (
		<ScrollArea>
			<TextInput
				placeholder="Search by any field"
				mb="md"
				leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
				value={search}
				onChange={handleSearchChange}
			/>
			<Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed">
				<Table.Thead>
					<Table.Tr>
						<Th
							sorted={sortBy === 'name'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('name')}
						>
							Name
						</Th>
						<Th
							sorted={sortBy === 'email'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('email')}
						>
							Email
						</Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{sortedData?.map((row) => (
						<Table.Tr key={row.id}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>{row.email}</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}