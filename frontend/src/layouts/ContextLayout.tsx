import ProtectedLayout from '../layouts/ProtectedLayout';
import { ChatsProvider } from '../contexts/ChatsContext';
import { MobileHeaderProvider } from '../contexts/MobileHeaderContext';
import { LoadingProvider } from '../contexts/LoadingContext';
import { MessagesProvider } from '../contexts/MessagesContext';

export default function ContextLayout() {
	return (
		<ChatsProvider>
			<MobileHeaderProvider>
				<MessagesProvider>
					<LoadingProvider>
						<ProtectedLayout />
					</LoadingProvider>
				</MessagesProvider>
			</MobileHeaderProvider>
		</ChatsProvider>
	);
}