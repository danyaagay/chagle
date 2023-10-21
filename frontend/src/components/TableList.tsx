import { useEffect, useState } from 'react';
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
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';

interface RowData {
	id: string;
	name: string;
	email: string;
	token: string;
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



export function TableList(props: any) {
	const [search, setSearch] = useState('');
	const [sortedData, setSortedData] = useState(props.data);
	const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);

	useEffect(() => {
		setSortedData(props.data);
		console.log(props.data);
	}, [props.data]);

	const setSorting = (field: keyof RowData) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(props.data, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(sortData(props.data, { sortBy, reversed: reverseSortDirection, search: value }));
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
						{sortedData.length > 0 && Object.keys(sortedData[0]).map((key) => (
							<Th
								key={key}
								sorted={sortBy === key}
								reversed={reverseSortDirection}
								onSort={() => setSorting(key)}
							>
								{key}
							</Th>
						))}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{sortedData.length > 0 && sortedData.map((row: any) => (
						<Table.Tr key={row.id}>
							{Object.keys(row).map((key) => (
								<Table.Td key={key}>{row[key]}</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>

		</ScrollArea>
	);
}