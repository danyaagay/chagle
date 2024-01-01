import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	TextInput,
	PasswordInput,
	Button,
	Stack,
	Stepper,
	Anchor,
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
	const { setUser, csrfToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const defaultType = location.pathname === '/signup' ? 'signup' : 'login';

	useEffect(() => {
		document.title = defaultType === 'signup'
			? 'Регистрация'
			: 'Вход';
	}, [location]);

	const handleSubmit = async () => {
		setIsLoading(true);

		if (type === 'login') {
			await csrfToken();
		}

		try {
			const resp = await axios.post(`/${type}`, form.values);
			if (resp.status === 200) {
				setUser(resp.data.user);

				// If user is not verify email, redirect to verify page
				if (!resp.data.user.email_verified_at) {
					return <Navigate to="/verify" />;
				}

				return <Navigate to="/chat" />;
			}
			setIsLoading(false);
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
				} else if (error.response.status === 401) {
					if (error.response.data.message) {
						form.setFieldError('email', true);
						form.setFieldError('password', error.response.data.message);
					} else {
						form.clearFieldError('name');
						form.clearFieldError('password');
					}
				}
			}
		}
	};

	const [type, setType] = useState(defaultType);
	const toggleType = () => {
		const newType = type === 'login' ? 'signup' : 'login';
		form.reset();
		setType(newType);
		navigate(`/${newType}`);
		setActive(0);
	};

	const form = useForm({
		initialValues: {
			email: '',
			name: '',
			password: '',
			password_confirmation: '',
		},

		validate: (values) => {
			if (type === 'signup') {
				if (active === 0) {
					return {
						name: (values.name.length < 2 ? 'Имя должно состоять как минимум из 2 букв' : null),
						email: (/^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
					};
				} else {
					return {
						password: (values.password.length <= 6 ? 'Пароль должен содержать минимум 6 символов.' : null),
						password_confirmation: (type === 'signup' && values.password_confirmation !== values.password ? 'Пароли не совпадают' : null),
					}
				}
			} else {
				return {
					email: (/^\S+@\S+$/.test(values.email) ? null : 'Неверный адрес электронной почты.'),
					password: (values.password.length <= 6 ? 'Пароль должен содержать минимум 6 символов.' : null),
				}
			}
		},
	});

	//Начало Шаги формы регистрации

	const [active, setActive] = useState(0);
	const nextStep = () =>
		setActive((current) => {
			if (form.validate().hasErrors) {
				return current;
			}
			return current < 2 ? current + 1 : current;
		});
	const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

	return (
		<div className={classes.main}>
			<div className={classes.container}>
				<div className={classes.box}>
					<div style={{textAlign: 'center'}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 26 26" fill="none">
							<path d="M12.0697 1.35872C12.4027 0.514573 13.5973 0.514571 13.9303 1.35872L16.8005 8.63617C16.9021 8.8939 17.1061 9.0979 17.3638 9.19955L24.6413 12.0697C25.4854 12.4027 25.4854 13.5973 24.6413 13.9303L17.3638 16.8005C17.1061 16.9021 16.9021 17.1061 16.8005 17.3638L13.9303 24.6413C13.5973 25.4854 12.4027 25.4854 12.0697 24.6413L9.19955 17.3638C9.0979 17.1061 8.8939 16.9021 8.63618 16.8005L1.35872 13.9303C0.514573 13.5973 0.514571 12.4027 1.35872 12.0697L8.63617 9.19955C8.8939 9.0979 9.0979 8.8939 9.19955 8.63618L12.0697 1.35872Z" fill="#228BE6" />
						</svg>
					</div>

					<p className={classes.title}>
						{type === 'signup' ?
							'Регистрация' :
							'Вход'}
					</p>

					<form onSubmit={form.onSubmit(handleSubmit)}>
						{type === 'signup' && (
							<>
								<Stepper active={active} classNames={{ content: classes.stepperContend, steps: classes.stepperSteps }}>
									<Stepper.Step>
										<Stack mt="2rem">
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
												required
												value={form.values.email}
												onChange={(value) => form.setFieldValue('email', value)}
												error={form.errors.email}
											/>
										</Stack>
									</Stepper.Step>

									<Stepper.Step>
										<Stack mt="2rem">
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
									</Stepper.Step>
								</Stepper>

								<Stack>
									{active !== 0 && (
										<Stack gap="xs">
											<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" fz="md" radius="md">
												Зарегистрироваться
											</Button>
											<Button variant="light" color="gray" fullWidth size="lg" fz="md" radius="md" onClick={prevStep}>
												Назад
											</Button>
										</Stack>
									)}
									{active !== 1 && <Button fullWidth mt="xl" size="lg" fz="md" radius="md" onClick={nextStep}>Далее</Button>}
								</Stack>
							</>
						)}

						{type !== 'signup' && (
							<>
								<Stack mt="2rem">
									<FloatingLabelInput
										label={'Электронная почта'}
										field='email'
										InputType={TextInput}
										required
										autoComplete='username'
										value={form.values.email}
										onChange={(value) => form.setFieldValue('email', value)}
										error={form.errors.email}
									/>
									<FloatingLabelInput
										label={'Пароль'}
										field='password'
										InputType={PasswordInput}
										required
										value={form.values.password}
										onChange={(value) => form.setFieldValue('password', value)}
										error={form.errors.password}
									/>
									<Anchor component="button" type="button" size="md" onClick={() => navigate('/reset-password')} ta="left">
										Забыли пароль?
									</Anchor>
								</Stack>
								<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" fz="md" radius="md">
									Войти
								</Button>
							</>
						)}

						<Button variant="subtle" onClick={() => toggleType()} fullWidth radius="md" ta="center" mt="lg" size="lg" fz="md" styles={{ root: { fontWeight: 'normal' } }}>
							{type === 'signup' ?
								'Вход' :
								'Регистрация'}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}