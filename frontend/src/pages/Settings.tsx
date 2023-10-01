import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios';
import { AxiosError } from 'axios';
import {
	TextInput,
	PasswordInput,
	Text,
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
	password: string;
	password_confirmation: string;
}


export default function Settings() {
	const { setUser, user } = useAuth();
	const [ isLoading, setIsLoading ] = useState(false);

	useEffect(() => {
		if (!location.pathname.includes('/settings')) {
			return;
		}

		// iOS detect
		function isiOS(): boolean {
			return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
			].includes(navigator.platform)
			// iPad on iOS 13 detection
			|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
		}

		if (isiOS()) {
			document.documentElement.classList.add('is-ios');
		}

		// Fix height
		const w = (window.visualViewport || window) as Window & typeof window.visualViewport;
		let setViewportVH = false; // HasFocus = false
		let lastVH: number | undefined;
		const setVH = (): void => {
			let vh = (setViewportVH ? w.height || w.innerHeight : window.innerHeight) * 0.01;
			vh = +vh.toFixed(2);
			if(lastVH === vh) {
				return;
			}

			lastVH = vh;

			document.documentElement.style.setProperty('--vh', `${vh}px`);
		};
		setVH();

		return () => {
			document.documentElement.style.removeProperty('--vh');
			// cleaning up the listeners here
		}
	}, [location.pathname]);
  	
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
					if (error.response.data.errors.password) {
						form.setFieldError('password', error.response.data.errors.password[0]);
					} else {
						form.clearFieldError('password');
					}
				}
			}
		}
	};
	
	const form = useForm({
		initialValues: {
			email: user.email,
			name: user.name,
			password: '',
			password_confirmation: '',
		},
	
		validate: (values) => {
			return {
				name: (values.name && values.name.length < 2 ? 'Имя должно состоять как минимум из 2 букв' : null),
				email: (values.email && /^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
				password: (values.password && values.password.length <= 6 ? 'Пароль должен содержать минимум 6 символов.' : null),
				password_confirmation: (values.password && values.password_confirmation !== values.password ? 'Пароли не совпадают' : null),
			};
		},
	});

	return (
		<>
		<Container className={classes.container} px={8}>
			<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
					<Stack gap="md" pt={16}>
						<Text fz="md" fw={500}>
							Основная информация
						</Text>
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
					<Stack mt="2rem" gap="md">
						<Text fz="md" fw={500}>
							Смена пароля
						</Text>
						<FloatingLabelInput
							label={'Пароль'}
							field='password'
							InputType={PasswordInput}
							needStrength
							value={form.values.password}
							onChange={(value) => form.setFieldValue('password', value)}
							error={form.errors.password}
						/>
						<FloatingLabelInput
							label={'Повторите пароль'}
							field='password_confirmation'
							InputType={PasswordInput}
							value={form.values.password_confirmation}
							onChange={(value) => form.setFieldValue('password_confirmation', value)}
							error={form.errors.password_confirmation}
						/>
					</Stack>
					<Button loading={isLoading} type="submit" mt="2rem" mb="2rem" size="md" radius="md" fw={500}>
						Сохранить
					</Button>
			</form>
		</Container>
		</>
	);
}