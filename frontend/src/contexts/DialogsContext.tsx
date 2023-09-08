import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from '../axios';
import { AxiosError, AxiosResponse } from 'axios';

type Dialog = {
	id: string;
	title: string;
};

type DialogsContextProps = {
	dialogs: Dialog[] | null;
	addDialog: (title: string, id: string) => void;
	updateDialog: (title: string, id: string) => void;
	deleteDialog: (id: string) => void;
};

const DialogsContext = createContext<DialogsContextProps>({
	dialogs: null,
	addDialog: () => {},
	updateDialog: () => {},
	deleteDialog: () => {},
});

const defaultDialogs: Dialog[] = [
	{
		id: '1',
		title: 'hello'
	}
];

type DialogsProviderProps = {
	children: ReactNode;
};

function DialogsProvider(props: DialogsProviderProps) {
    const [ dialogs, setDialogs ] = useState<Dialog[] | null>(defaultDialogs);

    useEffect(() => {
    	// Get all dialogs
        (async () => {
            try {
                const resp: AxiosResponse = await axios.get('/dialogs');
                console.log(resp);
                if (resp.status === 200) {
                    setDialogs(resp.data.dialogs);
                }
            } catch (error: unknown) {
                if (error instanceof AxiosError && error.response) {
                    console.log(error);
                }
            }
        })();
    }, []);

	// Add dialog
	const addDialog = (title: string, id: string): void => {
		if (dialogs) {
			const newDialog = {
				id: id,
				title: title
			};
	
			const newDialogs = [...dialogs, newDialog];
			setDialogs(newDialogs);
		}
	};

	// Edit dialog
	const updateDialog = (title: string, id: string): void => {
		if (dialogs) {
			const updatedDialogs = dialogs.map(dialog => {
				if (dialog.id === id) {
					return { ...dialog, title: title };
				}
				return dialog;
			});
			setDialogs(updatedDialogs);
		}
	};

	// Delete dialog
	const deleteDialog = (id: string): void => {
		if (dialogs) {
			setDialogs(dialogs.filter(dialog => dialog.id !== id));
		}
	};

	return (
		<DialogsContext.Provider value={{ dialogs, addDialog, updateDialog, deleteDialog }}>
			{props.children}
		</DialogsContext.Provider>
	);
}

export default DialogsContext;
export { DialogsProvider };
