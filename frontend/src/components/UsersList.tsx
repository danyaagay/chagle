import { useState } from 'react';
import {
	Table,
	ScrollArea,
	TextInput,
	ActionIcon,
	NumberInput,
	Flex,
	rem,
	Button
} from '@mantine/core';
import axios from '../axios';
import { IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedState } from '@mantine/hooks';

export function UsersList() {
	const [search, setSearch] = useDebouncedState('', 500);

	const [quickes, setQuickes] = useState([]);
	const handleQuickChange = (index: string, value: any) => {
		const updatedQuickes: any = [...quickes];
		updatedQuickes[index] = value;
		setQuickes(updatedQuickes);
	};

	const { data } = useQuery({
		queryKey: ['users', search],
		queryFn: async () => {
			const res = await axios.get(`/users?s=${search}`);
			return res.data;
		}
	});

	const queryClient = useQueryClient();

	const { mutate: mutationAdd } = useMutation({
		mutationFn: (data: any) => {
			return axios.post(`/quick/${data.id}`, { quick: quickes[data.key], telegram: data.telegram });
		},
		onSuccess: (_data, data: any) => {
			handleQuickChange(data.key, '');

			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});

	const { mutate: mutationSet } = useMutation({
		mutationFn: (data: any) => {
			return axios.post(`/level/${data.id}`, { level: data.level, telegram: data.telegram });
		},
		onSuccess: (_data, data: any) => {
			handleQuickChange(data.key, '');

			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});

	return (
		<ScrollArea>
			<TextInput
				placeholder="Поиск по любым данным"
				mb="md"
				leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
				defaultValue={search}
				onChange={(event) => setSearch(event.currentTarget.value)}
				radius={'md'}
			/>
			<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" miw={700}  striped>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>
							Имя
						</Table.Th>
						<Table.Th>
							Email
						</Table.Th>
						<Table.Th>
							Telegram
						</Table.Th>
						<Table.Th>
							Тариф
						</Table.Th>
						<Table.Th>
							Запросы
						</Table.Th>
						<Table.Th>
							Добавить запросы
						</Table.Th>
						<Table.Th>
							Активировать тариф
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{data?.map((row: any, i: any) => (
						<Table.Tr key={i}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>{row.email}</Table.Td>
							<Table.Td>{row.telegram_id}</Table.Td>
							<Table.Td>{row.level === 1 ? '0 ₽' : row.level === 2 ? '199 ₽' : '299 ₽'}</Table.Td>
							<Table.Td>{row.quick}</Table.Td>
							<Table.Td>
								<Flex gap="8">
									<NumberInput
										value={quickes[i] ?? ''}
										onChange={(value) => handleQuickChange(i, value)}
										min={1}
										radius={'md'}
										miw={100}
									/>
									<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd({ key: i, id: row.id, telegram: row.email ? false : true })} radius={'md'}>
										<IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
									</ActionIcon>
								</Flex>
							</Table.Td>
							<Table.Td>
								<Flex gap="8">
									<Button variant="default" h={36} onClick={() => mutationSet({ key: i, id: row.id, telegram: row.email ? false : true, level: 2 })} radius={'md'}>
										199 ₽
									</Button>
									<Button variant="default" h={36} onClick={() => mutationSet({ key: i, id: row.id, telegram: row.email ? false : true, level: 3 })} radius={'md'}>
										299 ₽
									</Button>
								</Flex>
							</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}