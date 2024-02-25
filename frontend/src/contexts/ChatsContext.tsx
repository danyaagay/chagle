import { createContext, ReactNode, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

type ChatsContextProps = {
	active: string | undefined;
	setActive: React.Dispatch<React.SetStateAction<string | undefined>>,
	pressed: string | undefined;
	setPressed: React.Dispatch<React.SetStateAction<string | undefined>>,
};

const ChatsContext = createContext<ChatsContextProps>({
	active: undefined,
	setActive: () => { },
	pressed: undefined,
	setPressed: () => { },
});

type ChatsProviderProps = {
	children: ReactNode;
};

function ChatsProvider(props: ChatsProviderProps) {
	const [ active, setActive ] = useState<string | undefined>(undefined);
	const [ pressed, setPressed ] = useState<string | undefined>(undefined);
	const location = useLocation();
	const { id } = useParams();

	useEffect(() => {
		setActive(id);
	}, [location]);

	return (
		<ChatsContext.Provider value={{ active, setActive, pressed, setPressed }}>
			{props.children}
		</ChatsContext.Provider>
	);
}

export default ChatsContext;
export { ChatsProvider };
