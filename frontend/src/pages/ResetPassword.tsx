import { useEffect, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import {
	TextInput,
	PasswordInput,
	Text,
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
	const [ isSended, setIsSended ] = useState(false);
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
				<div className='w-[350px]'>
					<Text    
						variant="gradient"
						gradient={{ from: 'indigo', to: '', deg: 45 }}
						ta="center"
						fw={700}
						size="1.5rem" 
						style={{
							flex: '0 0 auto',
						}}
					>
						-+-
					</Text>

					<Text ta="center" weight={500} className={classes.title}>
						Сброс пароля
					</Text>

					<form onSubmit={form.onSubmit(handleSubmit)}>
						{token && isSended && (
							<>
							<Stack mt="2rem">
								<Alert color="teal" radius="md" styles={{ message: { fontSize: '1rem' }}}>
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
							<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" radius="md">
								Далее
							</Button>
						</>
						)}

						{!token && (
							<>
							<Stack mt="2rem">
								{isSended && (
									<Alert color="teal" radius="md" styles={{ message: { fontSize: '1rem' }}}>
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
							<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" radius="md">
								Далее
							</Button>
							</>
						)}

						<Button variant="subtle" onClick={() => navigate('/login')} fullWidth radius="md" ta="center" mt="lg" size="lg" styles={{ root: { fontWeight: 'normal' } }}>
							Вход
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}