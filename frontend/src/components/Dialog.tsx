import React, { useRef, useState, useContext, useEffect } from 'react';
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
import MobileTitleContext from '../contexts/MobileTitleContext';
import DialogsContext from '../contexts/DialogsContext';
import axios from '../axios';
import { AxiosError } from 'axios';
import classes from '../css/ProtectedLayout.module.css';
  
interface ChatDialogButtonProps {
	dialogId: string,
	title: string,
	active: boolean,
	onClick(value: string): void,
}
  
export default function ChatDialogButton({
	dialogId,
	title,
	active,
	onClick,
	...props
}: ChatDialogButtonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
	const dialogTitleRef = useRef<HTMLInputElement>(null);
	const { hovered, ref } = useHover();
	const [ editable, editToggle ]  = useDisclosure(false);
	const [ deleting, { open, close } ]  = useDisclosure(false);
	const [ dialogTitle, setDialogTitle] = useState(title);
	const mobileScreen = useMediaQuery('(max-width: 767px)');
	const navigate = useNavigate();
	const { setMobileTitle } = useContext(MobileTitleContext);
	const { dispatchDialogs } = useContext(DialogsContext);

	useEffect(() => {
		// Set mobile title when loading page first time
		if (active) {
			setMobileTitle(dialogTitle);
		}
	}, [setMobileTitle]);

	// Handle delete dialog
	const handleDelete = async () => {
		try {
			const resp = await axios.delete('/dialogs/'+dialogId);
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

	// Handle edit dialog
	const handleEdit = async () => {
		try {
			if (dialogTitleRef.current) {
				dispatchDialogs({
					type: 'change',
					dialog: {
						title: dialogTitleRef.current.value,
						id: dialogId
					}
				});
				setDialogTitle(dialogTitleRef.current.value);
				if (active) {
					setMobileTitle(dialogTitleRef.current.value);
				}
				const resp = await axios.patch('/dialogs/'+dialogId, { title: dialogTitleRef.current.value });
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
		<Modal opened={deleting} onClose={close} title={`Удалить чат "${dialogTitle}"?`} centered withCloseButton={false}>
			<Group>
				<Button variant="subtle" onClick={close}>Отмена</Button>
				<Button
					variant="subtle"
					color="red"
					onClick={(e) => {
						e.stopPropagation();
						handleDelete();
						dispatchDialogs({
							type: 'delete',
							id: dialogId
						});
						if (active) {
							navigate('/chat');
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
			<a className={`${classes.link} ${active ? classes.linkActive : ''}`}>
				<IconMessageCircle2 className={classes.linkIcon} stroke={1.5} />
				{ editable ? (
					<TextInput
      					variant="unstyled"
						defaultValue={dialogTitle}
						size='sm'
						ref={dialogTitleRef}
    				/>
				) : (
					<span>{dialogTitle}</span>
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