import { useState } from 'react';
import {
	Table,
	ScrollArea,
	TextInput,
	ActionIcon,
	NumberInput,
	Flex,
	rem
} from '@mantine/core';
import axios from '../axios';
import { IconSearch } from '@tabler/icons-react';
import classes from '../css/TableSort.module.css';
import { IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedState } from '@mantine/hooks';
import { IS_MOBILE } from '../environment/userAgent';

export function UsersList() {
	const [search, setSearch] = useDebouncedState('', 500);

	const [balances, setBalances] = useState([]);
	const handleBalanceChange = (index: string, value: any) => {
		const updatedBalances: any = [...balances];
		updatedBalances[index] = value;
		setBalances(updatedBalances);
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
			return axios.post(`/balance/${data.id}`, { balance: (data.sum ? data.sum : balances[data.key]), telegram: data.telegram });
		},
		onSuccess: (_data, data: any) => {
			handleBalanceChange(data.key, '');

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
			<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" layout={IS_MOBILE ? undefined : 'fixed'} striped>
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
							Баланс
						</Table.Th>
						<Table.Th>
							Пополнить
						</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{data?.map((row: any, i: any) => (
						<Table.Tr key={i}>
							<Table.Td>{row.name}</Table.Td>
							<Table.Td>{row.email}</Table.Td>
							<Table.Td>{row.telegram_id}</Table.Td>
							<Table.Td>{row.balance}</Table.Td>
							<Table.Td>
								<Flex gap="8">
									<NumberInput
										value={balances[i] ?? ''}
										onChange={(value) => handleBalanceChange(i, value)}
										min={1}
										radius={'md'}
										miw={80}
									/>
									<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd({ key: i, id: row.id, telegram: row.email ? false : true })} radius={'md'}>
										<IconPlus style={{ width: '60%', height: '60%' }} stroke={1.5} />
									</ActionIcon>
									<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd({ sum: 199, id: row.id, telegram: row.email ? false : true })} radius={'md'}>
										199
									</ActionIcon>
									<ActionIcon variant="default" size="lg" w={36} h={36} onClick={() => mutationAdd({ sum: 599, id: row.id, telegram: row.email ? false : true })} radius={'md'}>
										599
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