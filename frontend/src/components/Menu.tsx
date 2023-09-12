import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../axios';
import {
    createStyles,
	MediaQuery,
	Burger,
    useMantineTheme,
    Navbar,
    Button,
    getStylesRef,
    UnstyledButton,
    rem,
} from '@mantine/core';
import {
	IconSettings,
	IconLogout,
	IconPlus,
} from '@tabler/icons-react';
import DialogsList from '../components/DialogsList';
import { useMobileTitle } from '../contexts/MobileTitleContext';

const useStyles = createStyles((theme) => ({
	footer: {
	  paddingTop: theme.spacing.md,
	  marginTop: theme.spacing.md,
	  borderTop: `${rem(1)} solid ${
		theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
	  }`,
	},
  
	link: {
	  ...theme.fn.focusStyles(),
	  width: '100%',
	  display: 'flex',
	  alignItems: 'center',
	  textDecoration: 'none',
	  fontSize: theme.fontSizes.nm,
	  color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
	  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
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
}));

export default function MobileHeader({ opened, setOpened }: { opened: boolean, setOpened: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { setMobileTitle } = useMobileTitle();
    const navigate = useNavigate();
    const { classes } = useStyles();
    const theme = useMantineTheme();

	// Logout user
	const handleLogout = async () => {
		try {
			const resp = await axios.post('/logout');
			if (resp.status === 200) {
				localStorage.removeItem('user');
				window.location.href = '/';
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mb='16px'
                />
            </MediaQuery>

            <Navbar.Section >
                <Button
                    leftIcon={<IconPlus />}
                    className={classes.link}
                    variant="default"
                    fullWidth
                    size='lg'
                    mb='16px'
                    onClick={() => {
                        setOpened((o) => !o);
                        setMobileTitle('Новый чат');
                        navigate('chat');
                    }}
                >
                    Новый чат
                </Button>
            </Navbar.Section>

            <Navbar.Section grow>
                <DialogsList opened={opened} setOpened={setOpened} />
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <NavLink
                    to='settings'
                    className={classes.link}
                    onClick={() => {
                        setOpened((o) => !o);
                        setMobileTitle('Настройки');
                    }}
                >
                    <IconSettings className={classes.linkIcon} stroke={1.5} />
                    <span>Настройки</span>
                </NavLink>

                <UnstyledButton className={classes.link} onClick={() => handleLogout()}>
                    <IconLogout className={classes.linkIcon} stroke={1.5} />
                    <span>Выйти</span>
                </UnstyledButton>
            </Navbar.Section>
        </Navbar>
	);
}