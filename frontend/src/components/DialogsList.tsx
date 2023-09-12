import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '../components/Dialog';
import DialogsContext from '../contexts/DialogsContext';
import MobileTitleContext from '../contexts/MobileTitleContext';

const DialogsList = ({ opened, setOpened }: { opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { dialogs, active } = useContext(DialogsContext);
	const { setMobileTitle } = useContext(MobileTitleContext);
	const navigate = useNavigate();
  
	return (
	  <div className="items-list">
			{dialogs && dialogs.map((dialog: any) => (
				<Dialog
					key={dialog.id}
					dialogId={dialog.id}
					title={dialog.title}
					active={active == dialog.id ? true : false}
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