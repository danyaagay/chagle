import { useEffect, useState } from 'react';
import {  Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { createFormContext } from '@mantine/form';
import {
	TextInput,
	PasswordInput,
	Text,
	Paper,
	Button,
	Anchor,
	Stack,
	Container,
	createStyles,
	rem,
} from '@mantine/core';

const useStyles = createStyles((theme, { floating, focused, error }: { floating: boolean, focused: boolean, error: any }) => ({
	root: {
	  position: 'relative',
	},
  
	label: {
	  position: 'absolute',
	  zIndex: 2,
	  top: rem(10),
	  left: theme.spacing.lg,
	  pointerEvents: 'none',
	  transformOrigin: 'left center',
	  color: focused ? error ? '#fa5252' : '#228be6' : error ? '#fa5252' : theme.colors.gray[5],
	  transition: '.2s transform,.2s color,.2s font-size,.2s padding,font-weight 0s .1s',
	  transform: floating ? `translate(-.4475rem, calc(50px / -2 + .0625rem)) scale(.75)` : 'none',
	  fontWeight: floating ? 500 : 400,
	  backgroundColor: '#ffffff',
	  padding: floating ? '0 5px' : undefined,
	},

	visibilityToggle: { color: focused ? error ? '#fa5252' : '#228be6' : undefined || error ? '#fa5252' : undefined},
}));

interface FormValues {
	email: string;
	name: string;
	password: string;
	password_confirmation: string;
}

const [FormProvider, useFormContext, useForm] = createFormContext<FormValues>();

function FloatingLabelInput({
	InputType,
	label,
	field,
	...rest 
}: {
	InputType: typeof TextInput | typeof PasswordInput,
	label: string,
	field: string
}) {
	const form = useFormContext();
	const [focused, setFocused] = useState(false);
	const { classes } = useStyles({ floating: form.values[field as keyof typeof form.values].trim().length !== 0 || focused, focused: focused, error: form.errors[field] });

	console.log(focused);

	return (
	  <InputType
		label={label}
		classNames={classes}
		onFocus={() => setFocused(true)}
		onBlur={() => setFocused(false)}
		size='lg'
		radius="md"
		fz="md"
		error={form.errors[field]}
		value={form.values[field as keyof typeof form.values]}
		onChange={(event) => form.setFieldValue(field, event.currentTarget.value)}
		{...rest}
	  />
	);
}


export default function Login() {
	const { setUser, csrfToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const defaultType = location.pathname === '/register' ? 'register' : 'login';

	useEffect(() => {
		document.title = defaultType === 'register'
		? "Регистрация"
		: 'Вход';
	}, []);

	const handleSubmit = async () => {
		setIsLoading(true);
		await csrfToken();
		try {
			const resp = await axios.post(location.pathname, form.values);
			if (resp.status === 200) {
				setUser(resp.data.user);
				return <Navigate to="/profile" />;
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
		const newType = type === 'login' ? 'register' : 'login';
		setType(newType);
		navigate(`/${newType}`);
	};

	const form = useForm({
		initialValues: {
			email: '',
			name: '',
			password: '',
		 	password_confirmation: '',
		},
	
		validate: {
			name: (value) => (value.length < 2 ? 'Имя должно состоять как минимум из 2 букв' : null),
			email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Неверный адрес электронной почты.'),
			password: (val) => (val.length <= 6 ? 'Пароль должен содержать минимум 6 символов.' : null),
			password_confirmation: (value, values) =>
				value !== values.password ? 'Пароли не совпадают' : null,
		},
	});

	return (
		<Container size={420} style={{
			position: 'absolute', left: '50%', top: '50%',
			transform: 'translate(-50%, -50%)',
			minWidth: '400px',
		}}>
		<Paper p="xl">
			<Text    
				variant="gradient"
	  			gradient={{ from: 'indigo', to: '', deg: 45 }}
	  			ta="center"
	  			fw={700}
				size="1.5rem">Луми</Text>

		  <Text ta="center" size="1.5rem" weight={500}>
			Добро пожаловать
		  </Text>
		  <FormProvider form={form}>
		  <form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack mt="2rem">
			  {type === 'register' && (
				<FloatingLabelInput
					label={'Имя'}
					field='name'
					InputType={TextInput}
				/>
			  )}

			  <FloatingLabelInput
				label={'Электронная почта'}
				field='email'
				InputType={TextInput}
			  />
	
			  <FloatingLabelInput
				label={'Пароль'}
				field='password'
				InputType={PasswordInput}
			  />

			{type === 'register' && (
			  <FloatingLabelInput
			    label={'Повторите пароль'}
			    field='password_confirmation'
			    InputType={PasswordInput}
			  />
			)}
			</Stack>

			<Button loading={isLoading} type="submit" fullWidth mt="xl" size="lg" radius="md" style={{ fontWeight: 'normal !important' }}>
				{type === 'register'
						? "Зарегистрироваться"
						: 'Войти'}
			</Button>

			<Text ta="center" mt="md" size="lg">
				<Anchor<'a'> onClick={() => toggleType()} weight='normal'>
				{type === 'register'
						? 'Вход'
						: "Регистрация"}
				</Anchor>
			</Text>
		  </form>
		  </FormProvider>
		</Paper>
		</Container>
	  );
}