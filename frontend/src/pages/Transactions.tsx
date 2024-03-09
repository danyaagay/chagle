import {
	Table,
	ScrollArea,
	Text,
	Box,
	Container,
} from '@mantine/core';
import axios from '../axios';
import classes from '../css/TableSort.module.css';
import { useInfiniteQuery } from '@tanstack/react-query';
import { IS_MOBILE } from '../environment/userAgent';
import { Scrollbars } from 'react-custom-scrollbars';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default function Transactions() {
	const { ref, inView } = useInView();
	let allItems: any;

	const {
		data,
		fetchNextPage,
		hasNextPage
	} = useInfiniteQuery({
		queryKey: ['transactions'],
		queryFn: async ({ pageParam }) => {
			const res = await axios.get('/transactions?offset=' + pageParam)
			return res.data;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage: any, _allPages: any) => {
            if (lastPage.hasMore === false) {
                return undefined;
            }
            return allItems ? allItems.length : 20;
        },
		staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
	})

	allItems = data?.pages?.flatMap((page: any) => page.transactions);

	useEffect(() => {
		if (inView) {
			fetchNextPage()
		}
	}, [fetchNextPage, inView]);

	function Th({ children }: any) {
		return (
			<Table.Th className={classes.th}>
				<Text fw={500} fz="sm">
					{children}
				</Text>
			</Table.Th>
		);
	}

	return (
		<>
			{!IS_MOBILE ? (
				<Scrollbars autoHide>
					<div style={{ 'maxWidth': '900px', 'margin': 'auto' }}>
						<Box>
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
										{allItems && allItems.map((row: any) => (
											<Table.Tr key={row.id}>
												<Table.Td>{row.type}</Table.Td>
												<Table.Td c={row.type == 'Списание' ? 'black' : 'blue.6'}>{row.type == 'Списание' ? '-' : '+'}{row.amount}</Table.Td>
												<Table.Td>{dayjs(row.created_at).format('DD.MM.YYYY в HH:mm')}</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
								{hasNextPage && <div ref={ref} style={{width: '100%', height: 20}}></div>}
							</ScrollArea>
						</Box>
					</div>
				</Scrollbars>

			) : (
				<Container px={8} style={{overflow: 'auto', height: '100%'}}>
					<Box>
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
									{allItems && allItems.map((row: any) => (
										<Table.Tr key={row.id}>
											<Table.Td c={row.type == 'Списание' ? 'black' : 'blue.6'}>{row.type == 'Списание' ? '-' : '+'}{row.amount}</Table.Td>
											<Table.Td>{dayjs(row.created_at).format('DD.MM.YYYY в HH:mm')}</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
							{hasNextPage && <div ref={ref} style={{width: '100%', height: 20}}></div>}
						</ScrollArea>
					</Box>
				</Container>
			)}
		</>
	);
}