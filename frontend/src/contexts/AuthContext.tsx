import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContent = createContext<{
	user: null | any;
	setUser: (user: any) => void;
	csrfToken: () => Promise<boolean>;
}>({
	user: null,
	setUser: () => { },
	csrfToken: async () => false,
});

export const AuthProvider = ({ children }: any) => {
	const [user, _setUser] = useState<string | null>(
		() => {
			const storedUser = localStorage.getItem('user');
			return storedUser ? JSON.parse(storedUser) : null;
		}
	);

	// set user to local storage
	const setUser = (user: any) => {
		if (user) {
			localStorage.setItem('user', JSON.stringify(user));
		} else {
			localStorage.removeItem('user');
		}
		_setUser(user);
	};

	// csrf token generation for guest methods
	const csrfToken = async () => {
		await axios.get(import.meta.env.MODE == 'development' ? "http://192.168.0.116:8000/sanctum/csrf-cookie" : "https://api.chagle.ru/sanctum/csrf-cookie");
		return true;
	};

	return (
		<AuthContent.Provider value={{ user, setUser, csrfToken }}>
			{children}
		</AuthContent.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContent);
};