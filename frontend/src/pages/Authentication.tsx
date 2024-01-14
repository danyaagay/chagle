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

import { useQuery } from '@tanstack/react-query';

export interface FormValues {
	email: string;
	name: string;
	password: string;
	password_confirmation: string;
}

//Сам компонент

function GoogleIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
	return (
	  <svg
		xmlns="http://www.w3.org/2000/svg"
		preserveAspectRatio="xMidYMid"
		viewBox="0 0 256 262"
		style={{ width: '0.9rem', height: '0.9rem' }}
		{...props}
	  >
		<path
		  fill="#4285F4"
		  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
		/>
		<path
		  fill="#34A853"
		  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
		/>
		<path
		  fill="#FBBC05"
		  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
		/>
		<path
		  fill="#EB4335"
		  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
		/>
	  </svg>
	);
  }

export default function () {
	const { setUser, csrfToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const defaultType = location.pathname === '/signup' ? 'signup' : 'login';

	const { data } = useQuery({
		queryKey: ['googleLoginUrl'],
		queryFn: () =>
			axios.get('/auth/redirect').then(
				(res) => res.data,
			),
	});

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
					<div style={{ textAlign: 'center' }}>
						<svg xmlns="http://www.w3.org/2000/svg" width="80" height="61" viewBox="0 0 38 29" fill="none">
							<path d="M18.0574 5.66014C18.3721 4.77212 19.6279 4.77212 19.9426 5.66014L22.242 12.1495C22.3427 12.4337 22.5663 12.6573 22.8505 12.758L29.3399 15.0574C30.2279 15.3721 30.2279 16.6279 29.3399 16.9426L22.8505 19.242C22.5663 19.3427 22.3427 19.5663 22.242 19.8505L19.9426 26.3399C19.6279 27.2279 18.3721 27.2279 18.0574 26.3399L15.758 19.8505C15.6573 19.5663 15.4337 19.3427 15.1495 19.242L8.66014 16.9426C7.77212 16.6279 7.77212 15.3721 8.66014 15.0574L15.1495 12.758C15.4337 12.6573 15.6573 12.4337 15.758 12.1495L18.0574 5.66014Z" fill="#228BE6" />
							<path d="M35 23.5V27.5M37 25.5H33M32.5 1V5M34.5 3L30.5 3M3 23.5V27.5M5 25.5H1M4.5 3.66014V7.66014M6.5 5.66014H2.5M15.1495 12.758L8.66014 15.0574C7.77212 15.3721 7.77212 16.6279 8.66014 16.9426L15.1495 19.242C15.4337 19.3427 15.6573 19.5663 15.758 19.8505L18.0574 26.3399C18.3721 27.2279 19.6279 27.2279 19.9426 26.3399L22.242 19.8505C22.3427 19.5663 22.5663 19.3427 22.8505 19.242L29.3399 16.9426C30.2279 16.6279 30.2279 15.3721 29.3399 15.0574L22.8505 12.758C22.5663 12.6573 22.3427 12.4337 22.242 12.1495L19.9426 5.66014C19.6279 4.77212 18.3721 4.77212 18.0574 5.66014L15.758 12.1495C15.6573 12.4337 15.4337 12.6573 15.1495 12.758Z" stroke="#228BE6" stroke-width="2" stroke-linecap="round" />
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
								{data?.url && (
									<Button component="a" leftSection={<GoogleIcon />} href={data.url} variant="default" fullWidth mt="md" size="lg" fz="md" radius="md">
										Войти через Google
									</Button>
								)}
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