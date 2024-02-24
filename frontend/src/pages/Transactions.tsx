import {
	Table,
	ScrollArea,
	Text,
	Box,
	Container,
} from '@mantine/core';
import axios from '../axios';
import classes from '../css/TableSort.module.css';
import { useQuery } from '@tanstack/react-query';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';

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
		<>
			{!IS_MOBILE ? (
				<Scrollbars autoHide>
					<div style={{ 'maxWidth': '900px', 'margin': 'auto' }}>
						<Box className={classes.root}>
							<ScrollArea>
								<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed" striped>
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
						</Box>
					</div>
				</Scrollbars>

			) : (
				<Container className={classes.container} px={8}>
					<Box className={classes.root}>
						<ScrollArea>
							<Table classNames={classes} horizontalSpacing="md" verticalSpacing="xs" layout="fixed" striped>
								<Table.Thead>
									<Table.Tr>
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
											<Table.Td c={row.type == 'Списание' ? 'black' : 'blue.6'}>{row.type == 'Списание' ? '-' : '+'}{row.amount}</Table.Td>
											<Table.Td>{dayjs(row.created_at).format('DD.MM.YYYY в HH:mm')}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</ScrollArea>
					</Box>
				</Container>
			)}
		</>
	);
}