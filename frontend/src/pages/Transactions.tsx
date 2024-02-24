import {
	Table,
	ScrollArea,
	Text,
} from '@mantine/core';
import axios from '../axios';
import classes from '../css/TableSort.module.css';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default function Transactions() {
	function Th({ children }: any) {
		return (
			<Table.Th className={classes.th}>
				<Text fw={500} fz="sm">
					{children}
				</Text>
			</Table.Th>
		);
	}

	const { data } = useQuery({
		queryKey: ['transactions'],
		queryFn: async () => {
			const res = await axios.get('/transactions');
			return res.data;
		}
	});

	return (
		<div className='container'>
			<ScrollArea>
				<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" miw={900} striped>
					<Table.Thead>
						<Table.Tr>
							<Th>
								Тип
							</Th>
							<Th>
								Сумма
							</Th>
							<Th>
								Дата
							</Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data && data.map((row: any) => (
							<Table.Tr key={row.id}>
								<Table.Td>{row.type}</Table.Td>
								<Table.Td c={row.type == 'Списание' ? 'black' : 'blue.6'}>{row.type == 'Списание' ? '-' : '+'}{row.amount}</Table.Td>
								<Table.Td>{dayjs(row.created_at).format('DD.MM.YYYY в HH:mm')}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</ScrollArea>
		</div>
	);
}