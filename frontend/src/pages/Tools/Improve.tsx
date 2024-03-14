import {
	Flex, Button, Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function Improve() {
	const form = useForm({
		initialValues: {
			field1: '',
			field2: '',
		},
	});


	return (
		<div className='container'>
			<Flex h='100%'>
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<Textarea
						label="Текст"
						placeholder="Небо синее, море красное.."
						radius="md"
						{...form.getInputProps('field1')}
					/>
					<div style={{marginTop: 'auto'}}>
						<Button variant="filled" radius="md" fullWidth>Улучшить</Button>
					</div>
				</div>
				<div>
					Результат
				</div>
			</Flex>
		</div>
	);
}