import { useState } from 'react';
import {
	TextInput,
	PasswordInput,
	Text,
	createStyles,
	rem,
	TextInputProps,
	PasswordInputProps,
	Box,
	Center,
	Progress,
	Group,
} from '@mantine/core';
import { useId } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';

const useStyles = createStyles((theme, { floating, focused, error }: { floating: boolean, focused: boolean, error: any }) => ({
	root: {
	  position: 'relative',
	},
  
	label: {
	  position: 'absolute',
	  zIndex: 2,
	  top: rem(10),
	  left: theme.spacing.lg,
	  pointerEvents: 'none',
	  transformOrigin: 'left center',
	  color: focused ? error ? '#fa5252' : '#228be6' : error ? '#fa5252' : theme.colors.gray[5],
	  transition: '.2s transform,.2s color,.2s font-size,.2s padding,font-weight 0s .1s',
	  transform: floating ? `translate(-.4475rem, calc(50px / -2 + .0625rem)) scale(.75)` : 'none',
	  fontWeight: floating ? 500 : 400,
	  backgroundColor: '#ffffff',
	  padding: floating ? '0 5px' : undefined,
	},

	visibilityToggle: { color: focused ? error ? '#fa5252' : '#228be6' : undefined || error ? '#fa5252' : undefined},
}));

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
	const { classes } = useStyles({ floating: value.trim().length !== 0 || focused, focused: focused, error: error });
	
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
			  styles={{ bar: { transitionDuration: '0ms' } }}
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
				{...props}
			/>
			{(needStrength && (value || focused)) && (
				<>
					<Group spacing={5} grow mt="xs" mb="md">
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