import { useContext } from 'react';
import {
	IconSend
} from '@tabler/icons-react';
import {
	createStyles,
	Textarea,
	Group,
	ActionIcon,
	Card,
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import DialogsContext from '../contexts/DialogsContext';
import MessagesContext from '../contexts/MessagesContext';

const useStyles = createStyles((theme) => ({
	linkIcon: {
		width: '28px',
		height: '28px',
		transform: 'rotate(40deg)',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
	}
}));

export default function MessageInput({textareaRef}: {textareaRef: React.RefObject<HTMLTextAreaElement>}) {
	const { classes } = useStyles();

	const { dispatchDialogs, setActive } = useContext(DialogsContext);
	const { messages, dispatch } = useContext(MessagesContext);

	const navigate = useNavigate();

	const { id } = useParams();

	// Handle send message
	const handleSend = async () => {
		try {
			if (textareaRef.current) {

				dispatch({
					type: 'add', 
					message: {
						id: -1,
						text: textareaRef.current.value,
						you: true,
					}
				});
		
		
				dispatch({
					type: 'add', 
					message: {
						id: -2,
						text: 'Печатает сообщение...',
						you: false
					}
				});

				console.log(messages);

				const resp = await axios.post('/messages/'+ (id ? id : ''), { text: textareaRef.current.value });
				console.log(resp);
				if (resp.status === 200) {
					dispatch({
						type: 'change',
						id: -1,
						message: {
							id: resp.data.message.id,
						}
					});

					dispatch({
						type: 'change',
						id: -2,
						message: {
							id: resp.data.answer.id,
							text: resp.data.answer.text
						}
					});

					if (resp.data.dialog) {
						dispatchDialogs({
							type: 'add',
							title: resp.data.dialog.title,
							id: resp.data.dialog.id
						});
						setActive(resp.data.dialog.id);
						window.history.replaceState(null, resp.data.dialog.title, '/chat/'+resp.data.dialog.id);
					}
				}
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response) {
				// Delete error
			}
		}
	};


	return (
		<Card shadow="0" padding="0" radius="lg" withBorder style={{ width: '100%' }}>
			<Group position="right" p="xs" style={{ padding: '5px 20px 5px 20px', alignItems: 'end' }}>
				<Textarea
					ref={textareaRef}
					sx={{ flexGrow: 1 }}
					placeholder="Сообщение"
					autosize
					minRows={1}
					maxRows={6}
					size="lg"
					styles={{ 
						input: { 
							padding: '8px 9px 9px 9px !important',
							scrollbarWidth: "none",
							msOverflowStyle: "none",
							'&::-webkit-scrollbar': {width:' 0 !important'},
							fontSize: '1rem',
						}
					}}
					variant="unstyled"
				/>
				<ActionIcon
					onClick={() => {
						handleSend();
						if (textareaRef.current) {
							textareaRef.current.value = '';
							textareaRef.current.focus();
						}
					}}
					variant="hover"
					size="lg"
					style={{  margin: '5px' }}
				>
					<IconSend stroke={1.5} className={classes.linkIcon} />
				</ActionIcon>
			</Group>
		</Card>
	);
}
