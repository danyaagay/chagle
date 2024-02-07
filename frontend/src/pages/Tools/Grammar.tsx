import {
	Flex, TextInput, Button, Group, Box, Textarea, Input, Paper, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export default function Grammar() {
	const [result, setResult] = useState('');

	const form = useForm({
		initialValues: {
			field1: '',
			field2: '',
		},
	});

	const click = () => {
		setResult(form.values['field1']);

		console.log(form.values['field1'], result);
	};

	return (
		<div className='container'>
			<Flex h="100%" w="100%" p={12}>
				<div style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%', margin: '5px 12px 8px 12px' }}>
					<Textarea
						placeholder="Исправьте ошибки в тексте"
						radius="md"
						h='100%'
						styles={{ wrapper: { height: '100%' }, input: { height: '100%' } }}
						mb={12}
						{...form.getInputProps('field1')}
					/>
					<div style={{ marginTop: 'auto' }}>
						<Button
							variant="filled"
							radius="md"
							fullWidth
							onClick={click}
						>Исправить</Button>
					</div>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', flexBasis: '50%', margin: '5px 12px 8px 12px' }}>
					{result &&
						<>
							<Paper radius="md" withBorder p="md">
								{result}
							</Paper>
							<div style={{ marginTop: 'auto' }}>
								<Group gap="xs" w='100%' ml='auto'>
									<Input placeholder="Корректировать" w={200} radius="md" />
									<Button variant="filled" radius="md">Перегенерировать</Button>
									<Button variant="filled" radius="md">Скопировать</Button>
								</Group>
							</div>
						</>
					}
				</div>
			</Flex>
		</div>
	);
}

//<Group gap={0} >
//	<ActionIcon variant="subtle" radius="md" aria-label="Settings">
//		<IconChevronLeft style={{ width: '70%', height: '70%' }} stroke={1.5} />
//	</ActionIcon>
//	<ActionIcon variant="subtle" radius="md" aria-label="Settings">
//		<IconChevronRight style={{ width: '70%', height: '70%' }} stroke={1.5} />
//	</ActionIcon>
//</Group>

//<div style={{ marginTop: 'auto' }}>
//	<Group gap="xs" w='100%'>
//		<Input placeholder="Корректировать" w='100%' radius="md" />
//		<Button variant="filled" radius="md">Отправить</Button>
//	</Group>
//</div>