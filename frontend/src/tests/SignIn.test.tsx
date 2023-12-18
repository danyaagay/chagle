import { AuthProvider } from '../contexts/AuthContext';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from "react-router-dom";
import routerConfig from '../router';
import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// declare which API requests to mock
const server = setupServer(
	http.post('http://192.168.0.116:8000/api/login', () => {
		return HttpResponse.json({
			"user": {
				"id": 4,
				"name": "Robert",
				"email": "admin@admin.com",
				"email_verified_at": "2023-10-23T09:39:36.000000Z",
				"roles": [
					"super-admin"
				],
				"created_at": "2023-10-23T09:39:36.000000Z",
				"updated_at": "2023-11-19T13:11:47.000000Z"
			}
		})
	}),

	http.post('http://192.168.0.116:8000/api/user', () => {
		return HttpResponse.json({
			"data": {
				"id": 4,
				"name": "Robert",
				"email": "admin@admin.com",
				"email_verified_at": "2023-10-23T09:39:36.000000Z",
				"roles": [
					"super-admin"
				],
				"created_at": "2023-10-23T09:39:36.000000Z",
				"updated_at": "2023-11-19T13:11:47.000000Z"
			}
		})
	}),

	http.get('http://192.168.0.116:8000/api/user', () => {
		return HttpResponse.json({
			"data": {
				"id": 4,
				"name": "Robert",
				"email": "admin@admin.com",
				"email_verified_at": "2023-10-23T09:39:36.000000Z",
				"roles": [
					"super-admin"
				],
				"created_at": "2023-10-23T09:39:36.000000Z",
				"updated_at": "2023-11-19T13:11:47.000000Z"
			}
		})
	}),

	http.get('http://192.168.0.116:8000/api/chats', () => {
		return HttpResponse.json({
			"chats": [
			]
		})
	}),

	http.post('http://192.168.0.116:8000/api/messages/', () => {
		return HttpResponse.text('data: {"message": "привет11"}')
	}),

	http.post('http://192.168.0.116:8000/api/settings-update', () => {
		return HttpResponse.json({
			"user": {
				"id": 4,
				"name": "Cheyanne11",
				"email": "admin@admin.com",
				"email_verified_at": "2023-10-23T09:39:36.000000Z",
				"roles": [
					"super-admin"
				],
				"created_at": "2023-10-23T09:39:36.000000Z",
				"updated_at": "2023-11-19T14:03:39.000000Z"
			}
		})
	}),
);

// establish API mocking before all tests
beforeAll(() => server.listen())
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers())
// clean up once the tests are done
afterAll(() => server.close())

test('allows the user to login successfully', async () => {
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

	await user.click(screen.getByRole('textbox', {
		name: /электронная почта/i
	}));

	await user.keyboard('admin@admin.com');

	await user.click(screen.getByLabelText(/пароль/i));

	await user.keyboard('password');

	await user.click(screen.getByRole('button', {
		name: /войти/i
	}));

	await waitFor(() => expect(screen.getByText(/настройки/i)).toBeInTheDocument(), { timeout: 5000 });
});

test('allows the user to create new chat send message successfully', async () => {
	const router = createBrowserRouter(routerConfig);

	const result = render(
		<AuthProvider>
			<MantineProvider>
				<Notifications />
				<RouterProvider router={router} />
			</MantineProvider>
		</AuthProvider>
	);

	const user = userEvent.setup();

	await waitFor(() => expect(screen.getByText(/настройки/i)).toBeInTheDocument(), { timeout: 5000 });

	await user.click(screen.getByRole('textbox'));

	await user.keyboard('Привет');
	// @ts-ignore
	await user.click(result.container.querySelector('#send'));

	await waitFor(() => expect(screen.getByText(/привет11/i)).toBeInTheDocument(), { timeout: 15000 });
});

test('allows the user to change settings successfully', async () => {
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

	await waitFor(() => expect(screen.getByText(/настройки/i)).toBeInTheDocument(), { timeout: 5000 });

	await user.click(screen.getByText(/настройки/i));

	await user.dblClick(screen.getByRole('textbox', {
		name: /имя/i
	}));

	await user.keyboard(faker.person.firstName());

	await user.click(screen.getByRole('button', {
		name: /сохранить/i
	}));

	await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), { timeout: 5000 });
});

