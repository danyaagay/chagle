import ProtectedLayout from '../layouts/ProtectedLayout';
import { ChatsProvider } from '../contexts/ChatsContext';
import { MobileHeaderProvider } from '../contexts/MobileHeaderContext';

export default function ContextLayout() {
	return (
		<ChatsProvider>
			<MobileHeaderProvider>
				<ProtectedLayout />
			</MobileHeaderProvider>
		</ChatsProvider>
	);
}