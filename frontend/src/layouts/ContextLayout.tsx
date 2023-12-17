import ProtectedLayout from '../layouts/ProtectedLayout';
import { ChatsProvider } from '../contexts/ChatsContext';
import { MobileHeaderProvider } from '../contexts/MobileHeaderContext';
import { LoadingProvider } from '../contexts/LoadingContext';

export default function ContextLayout() {
	return (
		<ChatsProvider>
			<MobileHeaderProvider>
					<LoadingProvider>
						<ProtectedLayout />
					</LoadingProvider>
			</MobileHeaderProvider>
		</ChatsProvider>
	);
}