import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import {
	TextInput,
	PasswordInput,
	Button,
	Stack,
	Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import FloatingLabelInput from '../components/FloatingLabelInput';
import classes from '../css/Authentication.module.css';

export interface FormValues {
	email: string;
	name: string;
	password: string;
	password_confirmation: string;
}

//Сам компонент

export default function () {
	const [isSended, setIsSended] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	let token = useParams().token ? useParams().token : '';

	const [localEmail, _setLocalEmail] = useState<string>(
		() => {
			const localStorageEmail = localStorage.getItem('email');
			return localStorageEmail ? localStorageEmail : '';
		}
	);

	const setLocalEmail = (email: string) => {
		if (email) {
			localStorage.setItem('email', email);
		} else {
			localStorage.removeItem('email');
		}
		_setLocalEmail(email);
	};

	useEffect(() => {
		'Сброс пароля';
	}, []);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const resp = await axios.post((token ? '/reset-password' : '/forgot-password'), form.values);
			if (resp.status === 200) {
				if (resp.data.errors) {
					form.setFieldError('email', resp.data.errors.email);
				} else {
					if (token) {
						setTimeout(() => {
							navigate('/login');
						}, 3000);
					} else {
						setLocalEmail(form.values.email);
					}
					setIsSended(true);
				}
			}
			setIsLoading(false);
		} catch (error: unknown) {
			setIsLoading(false);
			//...Проблемы
		}
	};

	const form = useForm({
		initialValues: {
			email: localEmail,
			password: '',
			password_confirmation: '',
			token: token,
		},

		validate: (values) => {
			if (token) {
				return {
					email: (/^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
					password: (values.password.length <= 6 ? 'Пароль должен содержать минимум 6 символов.' : null),
					password_confirmation: (values.password_confirmation !== values.password ? 'Пароли не совпадают' : null),
				}
			} else {
				return {
					email: (/^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
				}
			}
		},
	});

	console.log(token);

	//Начало формы

	return (
		<div className={classes.main}>
			<div className={classes.container}>
				<div className={classes.box}>
					<div style={{ textAlign: 'center' }}>
						<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 26 26" fill="none">
							<path d="M12.0697 1.35872C12.4027 0.514573 13.5973 0.514571 13.9303 1.35872L16.8005 8.63617C16.9021 8.8939 17.1061 9.0979 17.3638 9.19955L24.6413 12.0697C25.4854 12.4027 25.4854 13.5973 24.6413 13.9303L17.3638 16.8005C17.1061 16.9021 16.9021 17.1061 16.8005 17.3638L13.9303 24.6413C13.5973 25.4854 12.4027 25.4854 12.0697 24.6413L9.19955 17.3638C9.0979 17.1061 8.8939 16.9021 8.63618 16.8005L1.35872 13.9303C0.514573 13.5973 0.514571 12.4027 1.35872 12.0697L8.63617 9.19955C8.8939 9.0979 9.0979 8.8939 9.19955 8.63618L12.0697 1.35872Z" fill="#228BE6" />
						</svg>
					</div>

					<p className={classes.title}>
						Сброс пароля
					</p>

					<form onSubmit={form.onSubmit(handleSubmit)}>
						{token && isSended && (
							<>
								<Stack mt="2rem">
									<Alert color="teal" radius="md" styles={{ message: { fontSize: '1rem' } }}>
										Пароль обновлен, перенаправление на страницу входа..
									</Alert>
								</Stack>
							</>
						)}

						{token && !isSended && (
							<>
								<Stack mt="2rem">
									<FloatingLabelInput
										label={'Электронная почта'}
										field='email'
										InputType={TextInput}
										required
										autoComplete='email'
										value={form.values.email}
										onChange={(value) => form.setFieldValue('email', value)}
										error={form.errors.email}
									/>
									<FloatingLabelInput
										label={'Пароль'}
										field='password'
										InputType={PasswordInput}
										needStrength
										required
										value={form.values.password}
										onChange={(value) => form.setFieldValue('password', value)}
										error={form.errors.password}
									/>
									<FloatingLabelInput
										label={'Повторите пароль'}
										field='password_confirmation'
										InputType={PasswordInput}
										required
										value={form.values.password_confirmation}
										onChange={(value) => form.setFieldValue('password_confirmation', value)}
										error={form.errors.password_confirmation}
									/>
								</Stack>
								<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" fz="md" radius="md">
									Далее
								</Button>
							</>
						)}

						{!token && (
							<>
								<Stack mt="2rem">
									{isSended && (
										<Alert color="teal" radius="md" styles={{ message: { fontSize: '1rem' } }}>
											Ссылка для смены пароля отправлена на Вашу почту, если не можете найти письмо проверьте папку Спам
										</Alert>
									)}
									<FloatingLabelInput
										label={'Электронная почта'}
										field='email'
										InputType={TextInput}
										required
										autoComplete='email'
										value={form.values.email}
										onChange={(value) => form.setFieldValue('email', value)}
										error={form.errors.email}
									/>
								</Stack>
								<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" fz="md" radius="md">
									Далее
								</Button>
							</>
						)}

						<Button variant="subtle" onClick={() => navigate('/login')} fullWidth radius="md" ta="center" mt="lg" size="lg" fz="md" styles={{ root: { fontWeight: 'normal' } }}>
							Вход
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}