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
						<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 26 26" fill="none">
							<path d="M12.0697 1.35872C12.4027 0.514573 13.5973 0.514571 13.9303 1.35872L16.8005 8.63617C16.9021 8.8939 17.1061 9.0979 17.3638 9.19955L24.6413 12.0697C25.4854 12.4027 25.4854 13.5973 24.6413 13.9303L17.3638 16.8005C17.1061 16.9021 16.9021 17.1061 16.8005 17.3638L13.9303 24.6413C13.5973 25.4854 12.4027 25.4854 12.0697 24.6413L9.19955 17.3638C9.0979 17.1061 8.8939 16.9021 8.63618 16.8005L1.35872 13.9303C0.514573 13.5973 0.514571 12.4027 1.35872 12.0697L8.63617 9.19955C8.8939 9.0979 9.0979 8.8939 9.19955 8.63618L12.0697 1.35872Z" fill="#228BE6" />
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