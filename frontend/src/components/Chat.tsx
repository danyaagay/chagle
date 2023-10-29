import React, { useRef, useState, useContext } from 'react';
import {
	IconMessageCircle2,
	IconTrash,
	IconPencil,
	IconX,
	IconCheck
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import {
	ActionIcon,
	TextInput,
	Modal,
	Button,
	Group
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useHover, useDisclosure } from '@mantine/hooks';
import MobileTitleContext from '../contexts/MobileHeaderContext';
import ChatsContext from '../contexts/ChatsContext';
import axios from '../axios';
import { AxiosError } from 'axios';
import classes from '../css/ProtectedLayout.module.css';
  
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
	const [ editable, editToggle ]  = useDisclosure(false);
	const [ deleting, { open, close } ]  = useDisclosure(false);
	const [ chatTitle, setChatTitle ] = useState(title);
	const mobileScreen = useMediaQuery('(max-width: 767px)');
	const navigate = useNavigate();
	const { setMobileTitle } = useContext(MobileTitleContext);
	const { dispatchChats } = useContext(ChatsContext);

	// Handle delete chat
	const handleDelete = async () => {
		try {
			const resp = await axios.delete('/chats/'+chatId);
			console.log(resp);
			if (resp.status === 200) {
				// Done delete
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response) {
				// Delete error
			}
		}
	};

	// Handle edit chat
	const handleEdit = async () => {
		try {
			if (chatTitleRef.current) {
				dispatchChats({
					type: 'change',
					chat: {
						title: chatTitleRef.current.value,
						id: chatId
					}
				});
				setChatTitle(chatTitleRef.current.value);
				if (active) {
					setMobileTitle(chatTitleRef.current.value);
				}
				const resp = await axios.patch('/chats/'+chatId, { title: chatTitleRef.current.value });
				console.log(resp);
				if (resp.status === 200) {
					// Done change title
				}
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response) {
				// Change title error
			}
		}
	};
  
	return (
		<>
		<Modal opened={deleting} onClose={close} title={`Удалить чат "${chatTitle}"?`} centered withCloseButton={false}>
			<Group>
				<Button variant="subtle" onClick={close}>Отмена</Button>
				<Button
					variant="subtle"
					color="red"
					onClick={(e) => {
						e.stopPropagation();
						handleDelete();
						dispatchChats({
							type: 'delete',
							id: chatId
						});
						if (active) {
							setMobileTitle('Новый чат');
							navigate('chat');
						}
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
			<a className={`${mobileScreen ? classes.linkMobile : classes.link} ${active ? classes.linkActive : ''}`}>
				<IconMessageCircle2 className={classes.linkIcon} stroke={1.5} />
				{ editable ? (
					<TextInput
      					variant="unstyled"
						defaultValue={chatTitle}
						size='sm'
						ref={chatTitleRef}
    				/>
				) : (
					<span>{chatTitle}</span>
				) }

				{ !mobileScreen && hovered || active || editable ? (
					<div className={classes.buttonBox}>
						{ editable ? (
							<>
								<ActionIcon
									variant="transparent"
									size="lg"
									onClick={() => {
										handleEdit();
										editToggle.toggle();
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
				) : '' }
			</a>
		</div>
		</>
	);
  }