import { useState } from 'react';
import {
	TextInput,
	PasswordInput,
	Text,
	TextInputProps,
	PasswordInputProps,
	Box,
	Center,
	Progress,
	Group,
} from '@mantine/core';
import { useId } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';
import classes from '../css/FloatingLabelInput.module.css';

function FloatingLabelInput({
	label,
	field,
	InputType,
	value,
	onChange,
	error,
	needStrength,
	...props
}: {
	label: string,
	field: string,
	InputType: typeof TextInput | typeof PasswordInput,
	value: string,
	onChange(value: string): void,
	error: React.ReactNode,
	needStrength?: boolean,
} & Omit<TextInputProps, 'form' | 'onChange'> & Omit<PasswordInputProps, 'form' | 'onChange'>) {

	const uuid = useId(field);
	const [focused, setFocused] = useState(false);

	let checks, bars;
	if (needStrength) {
		const strength = getStrength(value);
		checks = requirements.map((requirement, index) => (
			<PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
		));
		bars = Array(4)
			.fill(0)
			.map((_, index) => (
				<Progress
					value={
						value.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
					}
					color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
					key={index}
					size={4}
				/>
			));
	}

	return (
		<div>
			<InputType
				withAsterisk={false}
				label={label}
				classNames={classes}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				size='lg'
				radius="md"
				fz="md"
				id={uuid}
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				error={error}
				labelProps={{
					'data-floating': value.trim().length !== 0 || focused || undefined,
					'data-focused': focused || undefined,
					'data-invalid': error || undefined
				}}
				{...props}
			/>
			{(needStrength && (value || focused)) && (
				<>
					<Group gap={5} grow mt="xs" mb="md">
						{bars}
					</Group>
					<PasswordRequirement label="Содержит минимум 6 символов" meets={value.length > 5} />
					{checks}
				</>
			)}
		</div>
	);
}

// Рекомендации
function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
	return (
		<Text color={meets ? 'teal' : 'red'} mt={5} size="sm">
			<Center inline>
				{meets ? <IconCheck size="0.9rem" stroke={1.5} /> : <IconX size="0.9rem" stroke={1.5} />}
				<Box ml={7}>{label}</Box>
			</Center>
		</Text>
	);
}

const requirements = [
	{ re: /[0-9]/, label: 'Включает цифру' },
	{ re: /[a-z]/, label: 'Включает букву нижнего регистра' },
	{ re: /[A-Z]/, label: 'Включает букву верхнего регистра' },
	{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Имеет специальный символ' },
];

function getStrength(password: string) {
	let multiplier = password.length > 5 ? 0 : 1;

	requirements.forEach((requirement) => {
		if (!requirement.re.test(password)) {
			multiplier += 1;
		}
	});

	return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

export default FloatingLabelInput;