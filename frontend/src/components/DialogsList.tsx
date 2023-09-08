import { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '../components/Dialog';
import DialogsContext from '../contexts/DialogsContext';

const DialogsList = () => {
	const { dialogs } = useContext(DialogsContext);
	const { id } = useParams();
	const [ opened, setOpened ] = useState(false);
	const [ mobileTitle, setMobileTitle ] = useState<string | false>(false);
	const navigate = useNavigate();
  
	return (
	  <div className="items-list">
			{dialogs && dialogs.map((dialog: any) => (
				<Dialog
					key={dialog.id}
					dialogId={dialog.id}
					title={dialog.title}
					active={id == dialog.id ? true : false}
					onClick={() => {
						setOpened((o) => !o);
						setMobileTitle(dialog.title);
						navigate('chat/'+dialog.id);
					}}
				/>
			))}
	  </div>
	);
};

export default DialogsList;