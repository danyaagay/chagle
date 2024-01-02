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
						<svg xmlns="http://www.w3.org/2000/svg" width="80" height="61" viewBox="0 0 38 29" fill="none">
							<path d="M18.0574 5.66014C18.3721 4.77212 19.6279 4.77212 19.9426 5.66014L22.242 12.1495C22.3427 12.4337 22.5663 12.6573 22.8505 12.758L29.3399 15.0574C30.2279 15.3721 30.2279 16.6279 29.3399 16.9426L22.8505 19.242C22.5663 19.3427 22.3427 19.5663 22.242 19.8505L19.9426 26.3399C19.6279 27.2279 18.3721 27.2279 18.0574 26.3399L15.758 19.8505C15.6573 19.5663 15.4337 19.3427 15.1495 19.242L8.66014 16.9426C7.77212 16.6279 7.77212 15.3721 8.66014 15.0574L15.1495 12.758C15.4337 12.6573 15.6573 12.4337 15.758 12.1495L18.0574 5.66014Z" fill="#228BE6" />
							<path d="M35 23.5V27.5M37 25.5H33M32.5 1V5M34.5 3L30.5 3M3 23.5V27.5M5 25.5H1M4.5 3.66014V7.66014M6.5 5.66014H2.5M15.1495 12.758L8.66014 15.0574C7.77212 15.3721 7.77212 16.6279 8.66014 16.9426L15.1495 19.242C15.4337 19.3427 15.6573 19.5663 15.758 19.8505L18.0574 26.3399C18.3721 27.2279 19.6279 27.2279 19.9426 26.3399L22.242 19.8505C22.3427 19.5663 22.5663 19.3427 22.8505 19.242L29.3399 16.9426C30.2279 16.6279 30.2279 15.3721 29.3399 15.0574L22.8505 12.758C22.5663 12.6573 22.3427 12.4337 22.242 12.1495L19.9426 5.66014C19.6279 4.77212 18.3721 4.77212 18.0574 5.66014L15.758 12.1495C15.6573 12.4337 15.4337 12.6573 15.1495 12.758Z" stroke="#228BE6" stroke-width="2" stroke-linecap="round" />
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