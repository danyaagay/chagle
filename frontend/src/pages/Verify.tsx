import { useEffect, useState } from 'react';
import {  Navigate, useParams } from 'react-router-dom';
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

					<Text ta="center" fw={500} className={classes.title}>
						{status ? 'Почта подтверждена' : 'Проверьте почту'}
					</Text>

					{status && (
						<>
						<Text ta="center" fz="sm" mt="xs" c="dimmed">
							Перенаправление...
						</Text>
						</>
					)}

					{!status && (
						<>
						<Stepper active={active} classNames={{content: classes.stepperContend, steps: classes.stepperSteps}}>
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
							<Button loading={isLoading} disabled={isButtonDisabled} rightSection={<Text size="sm">{isButtonDisabled ? `${Math.floor((60000 - remainingTime) / 1000)} сек.` : ''}</Text>} fullWidth mt="xl" size="lg" radius="md" onClick={handleSubmit}>Отправить повторно</Button>
							{/*
										<Stack spacing="xs">
											<Button fullWidth mt="xl" size="lg" radius="md" onClick={() => {
											
											}}>Отправить повторно</Button>
											<Button fullWidth size="lg" radius="md" styles={{ root: { fontWeight: 'normal' } }}  onClick={() => {
											
											}}>Изменить Email</Button>
										</Stack>
							*/}
							<Button variant="subtle" onClick={() => handleLogout()} fullWidth radius="md" ta="center" mt="xl" size="lg" styles={{ root: { fontWeight: 'normal' } }}>
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