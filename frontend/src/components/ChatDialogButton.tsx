import React, { useEffect, useState, useRef } from 'react';
import {
	IconMessageCircle2,
	IconTrash,
	IconPencil
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { createStyles, getStylesRef, rem, ActionIcon } from '@mantine/core';
import { useHover } from '@mantine/hooks';
  
const useStyles = createStyles((theme) => ({
	header: {
	  paddingBottom: theme.spacing.md,
	},
  
	footer: {
	  paddingTop: theme.spacing.md,
	  marginTop: theme.spacing.md,
	  borderTop: `${rem(1)} solid ${
		theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
	  }`,
	},
  
	link: {
	  ...theme.fn.focusStyles(),
	  display: 'flex',
	  alignItems: 'center',
	  textDecoration: 'none',
	  fontSize: theme.fontSizes.nm,
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
	  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
	  borderRadius: theme.radius.md,
	  cursor: 'pointer',
	  fontWeight: 400,
  
	  '&:hover': {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	  },
	},
  
	linkIcon: {
	  ref: getStylesRef('icon'),
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
	  marginRight: theme.spacing.sm,
	},
  
	linkActive: {
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
		[`& .${getStylesRef('icon')}`]: {
		  color: theme.colorScheme === 'dark' ? theme.white : theme.black,
		},
	},
  }));
  
  interface ChatDialogButtonProps {
	title: string,
	active: boolean,
  }
  
  export default function ChatDialogButton({ title, active, ...props }: ChatDialogButtonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
	const { classes } = useStyles();
	const { hovered, ref } = useHover();
	const mobileScreen = useMediaQuery('(max-width: 767px)');
  
	return (
		<div ref={ref} {...props}>
			<a className={`${classes.link} ${active ? classes.linkActive : ''}`}>
				<IconMessageCircle2 className={classes.linkIcon} stroke={1.5} />
				<span>{title}</span>
				{!mobileScreen && hovered || active ? (
					<div style={{ display: 'flex', position: 'absolute', right: 0, marginRight: '12px'}}>
						<ActionIcon variant="transparent" size="lg">
							<IconPencil className={classes.linkIcon} stroke={1.5} />
						</ActionIcon>	
						<ActionIcon variant="transparent" size="lg">
							<IconTrash className={classes.linkIcon} stroke={1.5} />
						</ActionIcon>
					</div>
				) : ''}
			</a>
		</div>
	);
  }