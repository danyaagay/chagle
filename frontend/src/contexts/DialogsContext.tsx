import { createContext, useEffect, useReducer, ReactNode, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../axios';
import { AxiosError, AxiosResponse } from 'axios';

type Dialog = {
	id: string;
	title: string;
};

type DialogsContextProps = {
	dialogs: Dialog[] | null;
	dispatchDialogs: React.Dispatch<Action>;
	active: string | undefined;
	setActive: React.Dispatch<React.SetStateAction<string | undefined>>,
};

const DialogsContext = createContext<DialogsContextProps>({
	dialogs: null,
	dispatchDialogs: () => { },
	active: undefined,
	setActive: () => { },
});

type DialogsProviderProps = {
	children: ReactNode;
};

function DialogsProvider(props: DialogsProviderProps) {
	const [dialogs, dispatchDialogs] = useReducer(dialogsReducer, []);
	const [active, setActive] = useState<string | undefined>(undefined);
	const location = useLocation();
	const { id } = useParams();

	useEffect(() => {
		// Get all dialogs
		(async () => {
			try {
				const resp: AxiosResponse<{ dialogs: Dialog[] }> = await axios.get('/dialogs');
				console.log(resp);
				if (resp.status === 200) {
					dispatchDialogs({ type: 'set', dialogs: resp.data.dialogs });
				}
			} catch (error: unknown) {
				if (error instanceof AxiosError && error.response) {
					console.log(error);
				}
			}
		})();

		return () => {
			setActive(undefined);
			dispatchDialogs({ type: 'set', dialogs: null });
		}
	}, []);


	useEffect(() => {
		setActive(id);
	}, [location]);

	return (
		<DialogsContext.Provider value={{ dialogs, dispatchDialogs, active, setActive }}>
			{props.children}
		</DialogsContext.Provider>
	);
}

type Action =
	| { type: 'set', dialogs: Dialog[] | null }
	| { type: 'add', id: string, title: string }
	| { type: 'change', dialog: Dialog }
	| { type: 'delete', id: string };

function dialogsReducer(dialogs: Dialog[], action: Action): Dialog[] {
	switch (action.type) {
		case 'set':
			return action.dialogs || [];
		case 'add':
			return [...dialogs, {
				id: action.id,
				title: action.title
			}];
		case 'change':
			return dialogs.map(dialog => {
				if (dialog.id === action.dialog.id) {
					return action.dialog;
				} else {
					return dialog;
				}
			});
		case 'delete':
			return dialogs.filter(dialog => dialog.id !== action.id);
		default:
			const { type } = action as never;
			throw new Error('Unknown action: ' + type);
	}
}

export default DialogsContext;
export { DialogsProvider };
