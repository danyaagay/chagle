import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';

import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Container,
} from '@mantine/core';

export default function Login(props: PaperProps) {
	const { setUser, csrfToken } = useAuth();
	const [error, setError] = React.useState(null);
	const [nameError, setNameError] = React.useState('');
	const [emailError, setEmailError] = React.useState('');
	const [passwordError, setPasswordError] = React.useState('');
	const navigate = useNavigate();

	const location = useLocation();
	const defaultType = location.pathname === '/login' ? 'login' : 'register';

	useEffect(() => {
		document.title = defaultType === 'register'
		? "Регистрация"
		: 'Вход';
	  }, []);
/*
	// login user
	const handleSubmit = async (e: any) => {
		e.preventDefault();
		const { email, password } = e.target.elements;
		const body = {
			email: email.value,
			password: password.value,
		};
		await csrfToken();
		try {
			const resp = await axios.post('/login', body);
			if (resp.status === 200) {
				setUser(resp.data.user);
				return <Navigate to="/profile" />;
			}
		} catch (error: unknown) {
			if (error instanceof AxiosError && error.response && error.response.status === 401) {
				setError(error.response.data.message);
			}
		}
	};
*/

const handleSubmit = async () => {
	const body = form.values;
	try {
		console.log('dsaasd');
		const resp = await axios.post('/register', body);
		if (resp.status === 200) {
			setUser(resp.data.user);
			return <Navigate to="/profile" />;
		}
	} catch (error: unknown) {
		console.log('dsaasd');
		console.log(error.response.status);
		if (error instanceof AxiosError && error.response && error.response.status === 422) {
			console.log(error.response.data.errors);
			if (error.response.data.errors.name) {
				setNameError(error.response.data.errors.name[0]);
			} else {
				setNameError('');
			}
			if (error.response.data.errors.email) {
				setEmailError(error.response.data.errors.email[0]);
			} else {
				setEmailError('');
			}
			if (error.response.data.errors.password) {
				setPasswordError(error.response.data.errors.password[0]);
			} else {
				setPasswordError('');
			}
		}
	}
};
	const [type, setType] = useState(defaultType);
	const toggleType = () => {
		const newType = type === 'login' ? 'register' : 'login';
		setType(newType);
		navigate(`/${newType}`);
	};

	const form = useForm({
	  initialValues: {
		email: '',
		name: '',
		password: '',
		cpassword: '',
	  },
  
	  validate: {
		email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
		password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
	  },
	});

	return (
		
		<Container size={420} style={{
			position: 'absolute', left: '50%', top: '50%',
			transform: 'translate(-50%, -50%)',
			minWidth: '370px',
		}}>
		<Paper radius="md" p="xl">
		  <Text ta="center" size="1.5rem" weight={500}>
			Добро пожаловать к{' '}
			<Text    
				span
				variant="gradient"
      			gradient={{ from: 'indigo', to: '', deg: 45 }}
      			ta="center"
      			fw={700}>Луми</Text>
		  </Text>
	
		  <form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack mt="2rem">
			  {type === 'register' && (
				<TextInput
				  placeholder='Имя'
				  value={form.values.name}
				  onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
				  error={nameError}
				  radius="md"
				  size="md"
				  fz="md"
				/>
			  )}
	
			  <TextInput
				required
				placeholder='Электронная почта'
				value={form.values.email}
				onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
				error={form.errors.email && 'Invalid email'}
				radius="md"
				size="md"
			  />
	
			  <PasswordInput
				required
				placeholder='Пароль'
				value={form.values.password}
				onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
				error={form.errors.password && 'Password should include at least 6 characters'}
				radius="md"
				size="md"
			  />

			  <PasswordInput
				required
				placeholder='Повторите пароль'
				value={form.values.cpassword}
				onChange={(event) => form.setFieldValue('cpassword', event.currentTarget.value)}
				error={form.errors.password && 'Password should include at least 6 characters'}
				radius="md"
				size="md"
			  />
			</Stack>

			<Button type="submit" fullWidth mt="xl" size="md" radius="md" style={{ fontWeight: 'normal !important' }}>
				{type === 'register'
						? "Зарегистрироваться"
						: 'Войти'}
        	</Button>

			<Text ta="center" mt="md">
				<Anchor<'a'> onClick={() => toggleType()} weight='normal'>
				{type === 'register'
						? 'Вход'
						: "Регистрация"}
				</Anchor>
			</Text>
		  </form>
		</Paper>
		</Container>
	  );
/*
	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="w-full text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
							Вход
						</h1>
						{error && (
							<div
								className="flex p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
								role="alert">
								<svg
									aria-hidden="true"
									className="flex-shrink-0 inline w-5 h-5 mr-3"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg">
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"></path>
								</svg>
								<span className="sr-only">Info</span>
								<div>{error}</div>
							</div>
						)}

						<form
							className="space-y-4 md:space-y-6"
							action="#"
							method="post"
							onSubmit={handleSubmit}>
							<div>
								<label
									htmlFor="email"
									className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									Адрес электронной почты
								</label>
								<input
									type="email"
									name="email"
									id="email"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="name@company.com"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									Пароль
								</label>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="••••••••"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									required
								/>
							</div>

							<button
								type="submit"
								className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
								Войти
							</button>
							<div className="w-full text-center text-sm font-light text-gray-500 dark:text-gray-400">
								<Link
									to="/register"
									className="font-medium text-primary-600 hover:underline dark:text-primary-500">
									Регистрация
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
	*/
}