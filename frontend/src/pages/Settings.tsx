import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios';
import { AxiosError } from 'axios';
import {
	TextInput,
	Button,
	Stack,
	Container,
} from '@mantine/core';
import {
	IconCheck
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { useForm } from '@mantine/form';
import classes from '../css/Settings.module.css';
export interface FormValues {
	email: string;
	name: string;
}

export default function Settings() {
	const { setUser, user } = useAuth();
	const [ isLoading, setIsLoading ] = useState(false);
	
	const handleSubmit = async () => {
		const dirtyValues: Partial<FormValues> = {};

		Object.keys(form.values).forEach((key) => {
			if (form.isDirty(key)) {
				dirtyValues[key as keyof FormValues] = (form.values as any)[key];
			}
		});

		setIsLoading(true);
		try {
			const resp = await axios.post(`/settings-update`, dirtyValues);
			console.log(resp);
			if (resp.status === 200) {
				setIsLoading(false);
				setUser(resp.data.user);
				notifications.show({
					message: 'Данные сохранены',
					icon: <IconCheck size="1.1rem" />,
					color: 'teal',
					withCloseButton: false,
					withBorder: true,
					autoClose: 4000,
				});
			}
		} catch (error: unknown) {
			setIsLoading(false);
			if (error instanceof AxiosError && error.response) {
				if (error.response.status === 422) {
					if (error.response.data.errors.name) {
						form.setFieldError('name', error.response.data.errors.name[0]);
					} else {
						form.clearFieldError('name');
					}
					if (error.response.data.errors.email) {
						form.setFieldError('email', error.response.data.errors.email[0]);
					} else {
						form.clearFieldError('email');
					}
				}
			}
		}
	};

	const form = useForm({
		initialValues: {
			email: user.email,
			name: user.name,
		},

		validate: (values) => {
			return {
				name: (values.name && values.name.length < 2 ? 'Имя должно состоять как минимум из 2 букв' : null),
				email: (values.email && /^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
			};
		},
	});

	return (
		<>
			<Container className={classes.container} px={8}>
				<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
					<Stack gap="md" pt={16}>
						<FloatingLabelInput
							autoComplete='name'
							label={'Имя'}
							field='name'
							InputType={TextInput}
							value={form.values.name}
							onChange={(value) => form.setFieldValue('name', value)}
							error={form.errors.name}
						/>
						<FloatingLabelInput
							autoComplete='email'
							label={'Электронная почта'}
							field='email'
							InputType={TextInput}
							value={form.values.email}
							onChange={(value) => form.setFieldValue('email', value)}
							error={form.errors.email}
						/>
					</Stack>
					<Button loading={isLoading} type="submit" mt="1rem" mb="2rem" size="md" radius="md">
						Сохранить
					</Button>
				</form>
			</Container>
		</>
	);
}