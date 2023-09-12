import React, { useRef, useState, useContext, useEffect } from 'react';
import {
	IconMessageCircle2,
	IconTrash,
	IconPencil,
	IconX,
	IconCheck
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { createStyles, getStylesRef, rem, ActionIcon, TextInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useHover, useDisclosure } from '@mantine/hooks';
import axios from '../axios';
import { AxiosError } from 'axios';
import MobileTitleContext from '../contexts/MobileTitleContext';
import DialogsContext from '../contexts/DialogsContext';
  
const useStyles = createStyles((theme) => ({
	header: {
	  paddingBottom: theme.spacing.md,
	},
  
	footer: {
	  paddingTop: theme.spacing.md,
	  marginTop: theme.spacing.md,
	  borderTop: `${rem(1)} solid ${
		theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
	  }`,
	},
  
	link: {
	  ...theme.fn.focusStyles(),
	  display: 'flex',
	  alignItems: 'center',
	  textDecoration: 'none',
	  fontSize: theme.fontSizes.nm,
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
	  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
	  borderRadius: theme.radius.md,
	  cursor: 'pointer',
	  fontWeight: 400,
	  height: '48px',
  
	  '&:hover': {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	  },
	},
  
	linkIcon: {
	  ref: getStylesRef('icon'),
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
	  marginRight: theme.spacing.sm,
	},
  
	linkActive: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	},

	buttonBox: {
		display: 'flex',
		position: 'absolute',
		right: 0,
		marginRight: '12px'
	}
}));
  
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
	const { classes } = useStyles();
	const { hovered, ref } = useHover();
	const [ editable, toggle ]  = useDisclosure(false);
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
						size='nm'
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
										toggle.toggle();
									}}
								>
									<IconCheck className={classes.linkIcon} stroke={1.5} />
								</ActionIcon>	
								<ActionIcon
									variant="transparent"
									size="lg"
									onClick={() => {
										toggle.toggle();
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
										toggle.toggle();
									}}
								>
									<IconPencil className={classes.linkIcon} stroke={1.5} />
								</ActionIcon>	
								<ActionIcon
									variant="transparent"
									size="lg"
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
	);
  }