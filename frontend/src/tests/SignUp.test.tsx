import { AuthProvider } from '../contexts/AuthContext';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from "react-router-dom";
// @ts-ignore
import routerConfig from '../router';
import { faker } from '@faker-js/faker';

test('allows the user to register successfully', async () => {
	const router = createBrowserRouter(routerConfig);

	render(
		<AuthProvider>
			<MantineProvider>
				<Notifications />
				<RouterProvider router={router} />
			</MantineProvider>
		</AuthProvider>
	);

	const user = userEvent.setup();

	expect(screen.getByText(/вход в луми/i)).toBeInTheDocument();

	await user.click(screen.getByRole('button', {
		name: /регистрация/i
	}));

	expect(screen.getByText(/регистрация в луми/i)).toBeInTheDocument();

	await user.click(screen.getByRole('textbox', {
		name: /имя/i
	}));

	await user.keyboard(faker.person.firstName());

	await user.click(screen.getByRole('textbox', {
		name: /электронная почта/i
	}));

	await user.keyboard(faker.internet.email());

	await user.click(screen.getByRole('button', {
		name: /далее/i
	}));

	await user.click(screen.getByLabelText('Пароль'));

	const password = faker.internet.password({prefix: '!'});

	await user.keyboard(password);

	await user.click(screen.getByLabelText(/повторите пароль/i));

	await user.keyboard(password);

	await user.click(screen.getByRole('button', {
		name: /зарегистрироваться/i
	}));

	await waitFor(() => expect(screen.getByText(/проверьте почту/i)).toBeInTheDocument(), {timeout: 5000});
});