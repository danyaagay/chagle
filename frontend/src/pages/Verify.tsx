import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	Text,
	Button,
	Stack,
	Stepper,
} from '@mantine/core';
import classes from '../css/Authentication.module.css';

export interface FormValues {
	email: string;
	name: string;
	password: string;
	password_confirmation: string;
}

//Сам компонент

export default function () {
	const [active] = useState(0);
	const { user, setUser, csrfToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [remainingTime, setRemainingTime] = useState(0);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	let status = useParams().status ? useParams().status : '';

	useEffect(() => {
		document.title = (status ? 'Почта подтверждена' : 'Подтвердите почту');

		// Check if user is logged in or not from server
		(async () => {
			try {
				const resp = await axios.get('/user', user);
				if (resp.status === 200) {
					setUser(resp.data.data);
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response && error.response.status === 401) {
					localStorage.removeItem('user');
					window.location.href = '/';
					console.log(error);
				}
			}
		})();
	}, []);

	// If user is not logged in, redirect to login page
	if (!user) {
		return <Navigate to="/" />;
	}

	// If user verify email, redirect to chat page
	if (user.email_verified_at) {
		return <Navigate to="/chat" />;
	}

	// Logout user
	const handleLogout = async () => {
		try {
			const resp = await axios.post('/logout');
			if (resp.status === 200) {
				localStorage.removeItem('user');
				window.location.href = '/';
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		//if (type === 'login') {
		await csrfToken();
		//}

		try {
			const resp = await axios.post('email/verify/resend');
			if (resp.status === 200) {
				console.log('resending');
			}
			setIsLoading(false);
		} catch (error: unknown) {
			setIsLoading(false);
			if (error instanceof AxiosError && error.response) {
				if (error.response.status === 422) {
					if (error.response.data.errors.name) {

					} else {

					}
					if (error.response.data.errors.email) {

					} else {

					}
					if (error.response.data.errors.password) {

					} else {

					}
				} else if (error.response.status === 401) {
					if (error.response.data.message) {

					} else {

					}
				}
			}
		}

		setIsButtonDisabled(true);

		// Запускаем таймер, который каждую секунду обновляет оставшееся время
		const timer = setInterval(() => {
			setRemainingTime((prevTime) => prevTime + 1000);
		}, 1000);

		setTimeout(() => {
			clearInterval(timer);
			setIsButtonDisabled(false);
			setRemainingTime(0);
			setIsLoading(false);
		}, 60000);
	};

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
						{status ? 'Почта подтверждена' : 'Проверьте почту'}
					</p>

					{status && (
						<Text ta="center" fz="sm" mt="xs" c="dimmed">
							Перенаправление...
						</Text>
					)}

					{!status && (
						<>
							<Stepper active={active} classNames={{ content: classes.stepperContend, steps: classes.stepperSteps }}>
								<Stepper.Step>
									<Text ta="center" fz="md" mt="2rem" c="dimmed">
										Мы отправили Вам ссылку для подтверждения на {user.email}
									</Text>
								</Stepper.Step>
								{/*
									<Stepper.Step>
										<Stack mt="2rem">
											Мы отправили Вам ссылку для подтверждения на адрес электронной почты
										</Stack>
									</Stepper.Step>
							*/}
							</Stepper>
							<Stack>
								{active === 0 && (
									<>
										<Button loading={isLoading} disabled={isButtonDisabled} rightSection={<Text size="sm">{isButtonDisabled ? `${Math.floor((60000 - remainingTime) / 1000)} сек.` : ''}</Text>} fullWidth mt="xl" size="lg" fz="md" radius="md" onClick={handleSubmit}>Отправить повторно</Button>
										{/*
										<Stack spacing="xs">
											<Button fullWidth mt="xl" size="lg" radius="md" onClick={() => {
											
											}}>Отправить повторно</Button>
											<Button fullWidth size="lg" radius="md" styles={{ root: { fontWeight: 'normal' } }}  onClick={() => {
											
											}}>Изменить Email</Button>
										</Stack>
							*/}
										<Button variant="subtle" onClick={() => handleLogout()} fullWidth radius="md" ta="center" mt="xl" size="lg" fz="md" styles={{ root: { fontWeight: 'normal' } }}>
											Выйти
										</Button>
									</>
								)}
							</Stack>
						</>
					)}
				</div>
			</div>
		</div>
	);
}