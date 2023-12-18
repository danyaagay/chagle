import React, { useRef, useState, useContext } from 'react';
import {
	IconMessageCircle2,
	IconTrash,
	IconPencil,
	IconX,
	IconCheck
} from '@tabler/icons-react';
import {
	ActionIcon,
	Modal,
	Button,
	Group
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useHover, useDisclosure } from '@mantine/hooks';
import MobileTitleContext from '../contexts/MobileHeaderContext';
import axios from '../axios';
import { IS_MOBILE } from '../environment/userAgent';
import classes from '../css/ProtectedLayout.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ChatChatButtonProps {
	chatId: string,
	title: string,
	active: boolean,
	onClick(value: string): void,
}

export default function ChatChatButton({
	chatId,
	title,
	active,
	onClick,
	...props
}: ChatChatButtonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
	const chatTitleRef = useRef<HTMLInputElement>(null);
	const { hovered, ref } = useHover();
	const [editable, editToggle] = useDisclosure(false);
	const [deleting, { open, close }] = useDisclosure(false);
	const [chatTitle, setChatTitle] = useState(title);
	const navigate = useNavigate();
	const { setMobileTitle } = useContext(MobileTitleContext);

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
			if (active) {
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
				if (active) {
					setMobileTitle(chatTitleRef.current.value);
				}
			}

			editToggle.toggle();
		},
	});

	return (
		<>
			<Modal opened={deleting} onClose={close} title={`Удалить чат "${chatTitle}"?`} centered withCloseButton={false}>
				<Group>
					<Button variant="subtle" onClick={close}>Отмена</Button>
					<Button
						variant="subtle"
						color="red"
						onClick={() => {
							mutationDelete({ id: chatId });
						}}>
						Удалить
					</Button>
				</Group>
			</Modal>
			<div ref={ref} {...props} onClick={(e) => {
				if (editable) {
					e.stopPropagation();
				} else {
					onClick(e);
				}
			}}
			>
				<a className={`${IS_MOBILE ? classes.linkMobile : classes.link} ${active ? classes.linkActive : ''}`}>
					<IconMessageCircle2 className={classes.linkIcon} stroke={1.5} />
					{editable ? (
						<input
							defaultValue={chatTitle}
							ref={chatTitleRef}
							className={classes.linkSpan}
						/>
					) : (
						<span className={classes.linkSpan}>{chatTitle}</span>
					)}

					{!IS_MOBILE && hovered || active || editable ? (
						<div className={classes.buttonBox}>
							{editable ? (
								<>
									<ActionIcon
										variant="transparent"
										size="lg"
										onClick={() => {
											mutationEdit({
												id: chatId,
												title: chatTitleRef.current?.value
											});
										}}
									>
										<IconCheck className={classes.linkIcon} stroke={1.5} />
									</ActionIcon>
									<ActionIcon
										variant="transparent"
										size="lg"
										onClick={() => {
											editToggle.toggle();
										}}
									>
										<IconX className={classes.linkIcon} stroke={1.5} />
									</ActionIcon>
								</>
							) : (
								<>
									<ActionIcon
										variant="transparent"
										size="lg"
										onClick={(e) => {
											e.stopPropagation();
											editToggle.toggle();
										}}
									>
										<IconPencil className={classes.linkIcon} stroke={1.5} />
									</ActionIcon>
									<ActionIcon
										variant="transparent"
										size="lg"
										onClick={(e) => {
											e.stopPropagation();
											open();
										}}
									>
										<IconTrash className={classes.linkIcon} stroke={1.5} />
									</ActionIcon>
								</>
							)}
						</div>
					) : ''}
				</a>
			</div>
		</>
	);
}