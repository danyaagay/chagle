import React, { useRef, useState, useContext } from 'react';
import {
	IconTrash,
	IconPencil,
	IconX,
	IconCheck
} from '@tabler/icons-react';
import {
	ActionIcon,
	Modal,
	Button,
	Group,
	Flex,
	Text
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useHover, useDisclosure } from '@mantine/hooks';
import MobileTitleContext from '../contexts/MobileHeaderContext';
import axios from '../axios';
import { IS_MOBILE } from '../environment/userAgent';
import classes from '../css/ProtectedLayout.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClickOutside } from '@mantine/hooks';

import ChatsContext from '../contexts/ChatsContext';
import useLongPress from '../hooks/useLongPress';

interface ChatChatButtonProps {
	chatId: string,
	title: string,
	sub_title: string,
	date: string,
}

export default function ChatChatButton({
	chatId,
	title,
	sub_title,
	date
}: ChatChatButtonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
	const chatTitleRef = useRef<HTMLInputElement>(null);
	const { hovered, ref } = useHover();
	const refOutside = useClickOutside(() => {
		if(isPressed) {
			setPressed(undefined);
		}
	});
	const [editable, editToggle] = useDisclosure(false);
	const [deleting, { open, close }] = useDisclosure(false);
	const [chatTitle, setChatTitle] = useState(title);
	const navigate = useNavigate();
	const { setMobileTitle, opened, toggle } = useContext(MobileTitleContext);



	const { active, setActive, pressed, setPressed } = useContext(ChatsContext);
	const isActive = active == chatId;
	const isPressed = pressed == chatId;
	const onLongPress = () => {
		setPressed(chatId);
	};

	const onClick = () => {
		if (IS_MOBILE && !editable && !isPressed || !IS_MOBILE && !editable) {
			setMobileTitle(title);
			document.title = title;
			setActive(chatId);
			setPressed(undefined);
			navigate('chat/' + chatId);
			if (opened) {
				toggle();
			}
		}
	}

	const defaultOptions = {
		shouldPreventDefault: false,
		delay: 300,
	};
	const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);



	const queryClient = useQueryClient();

	const { mutate: mutationDelete } = useMutation({
		mutationFn: (data: any) => {
			return axios.delete('/chats/' + data.id);
		},
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: ['chats'] });

			const previousChat = queryClient.getQueryData(['chats']);

			queryClient.setQueryData(['chats'], (oldChats: any) => {
				const updatedChats = oldChats.filter((chat: any) => chat.id !== data.id);
				return updatedChats;
			});

			return { previousChat };
		},
		onSuccess: () => {
			if (isActive) {
				setMobileTitle('Новый чат');
				navigate('chat');
			}
		},
	});

	const { mutate: mutationEdit } = useMutation({
		mutationFn: (data: any) => {
			return axios.patch('/chats/' + data.id, { title: data.title });
		},
		onMutate: async (data) => {
			await queryClient.cancelQueries({ queryKey: ['chats'] });

			const previousChat = queryClient.getQueryData(['chats']);

			queryClient.setQueryData(['chats'], (oldChats: any) => {
				const updatedChats = oldChats.map((chat: any) => {
					if (chat.id === data.id) {
						return { ...chat, title: data.title };
					}
					return chat;
				});
				return updatedChats;
			});

			return { previousChat };
		},
		onSuccess: () => {
			if (chatTitleRef.current) {
				setChatTitle(chatTitleRef.current.value);
				if (isActive) {
					setMobileTitle(chatTitleRef.current.value);
				}
			}

			editToggle.toggle();
		},
	});

	return (
		<>
			<Modal opened={deleting} onClose={close} title={`Удалить чат "${chatTitle}"?`} centered withCloseButton={false} radius={'md'}>
				<Group>
					<Button
						variant="subtle"
						radius={'md'}
						onClick={close}
					>
						Отмена
					</Button>
					<Button
						variant="subtle"
						radius={'md'}
						color="red"
						onClick={() => {
							mutationDelete({ id: chatId });
						}}
					>
						Удалить
					</Button>
				</Group>
			</Modal>
			<div ref={refOutside} {...longPressEvent as any} className="unselectable">
				<div ref={ref} className={`${IS_MOBILE ? classes.chatLinkMobile : classes.chatLink} ${!IS_MOBILE && isActive || IS_MOBILE && isPressed ? classes.chatLinkActive : ''}`}>
					{editable ? (
						<>
							<div style={{ display: 'flex' }}>
								<input
									defaultValue={chatTitle}
									ref={chatTitleRef}
									className={classes.chatInputSpan}
								/>
								<div className={classes.buttonBox} style={{
									alignItems: 'center',
									marginLeft: 'auto'
								}}>
									<Flex gap={2}>
										<ActionIcon
											variant="transparent"
											size="sm"
											onClick={() => {
												mutationEdit({
													id: chatId,
													title: chatTitleRef.current?.value
												});
												setPressed(undefined);
											}}
										>
											<IconCheck className={classes.linkIcon} stroke={1.5} style={{ width: '22px', height: '22px' }} />
										</ActionIcon>
										<ActionIcon
											variant="transparent"
											size="sm"
											onClick={() => {
												editToggle.toggle();
											}}
										>
											<IconX className={classes.linkIcon} stroke={1.5} style={{ width: '22px', height: '22px' }} />
										</ActionIcon>
									</Flex>
								</div>
							</div>
						</>
					) : (
						<>
							<div className={classes.chatSpanBox}>
								<span className={classes.chatSpan}>{chatTitle}</span>
								<Text c="dimmed" size={date.length > 2 ? "xs" : "sm"} className={classes.chatTimeBox}>
									{date}
								</Text>

							</div>

							<div className={classes.chatSpanBox}>
								<Text c="dimmed" size="sm" className={classes.chatSpan}>
									{sub_title}
								</Text>

								{!IS_MOBILE && hovered || editable || !IS_MOBILE && isActive || IS_MOBILE && isPressed ? (
									<div className={classes.buttonBox}>
										<Flex gap={2}>
											<ActionIcon
												variant="transparent"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													editToggle.toggle();
												}}
											>
												<IconPencil className={classes.linkIcon} stroke={1.5} style={{ width: '22px', height: '22px' }} />
											</ActionIcon>
											<ActionIcon
												variant="transparent"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													open();
												}}
											>
												<IconTrash className={classes.linkIcon} stroke={1.5} style={{ width: '22px', height: '22px' }} />
											</ActionIcon>
										</Flex>
									</div>
								) : ''}
							</div>
						</>)}
				</div>
			</div>
		</>
	);
}