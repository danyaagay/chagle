import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Burger,
    useMantineTheme,
    Button,
    NavLink
} from '@mantine/core';
import {
    IconSettings,
    IconLogout,
    IconPlus,
    IconHome2,
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';

export default function MobileHeader() {
    const { mobileTitle, setMobileTitle, opened, toggle } = useMobileHeader();
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
        <>
            <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                color={theme.colors.gray[6]}
                mb='16px'
                className={classes.burger}
            />

            <Button
                component={Link}
                to='chat'
                leftSection={<IconPlus />}
                className={classes.link}
                variant="default"
                fullWidth
                size='sm'
                mb='16px'
                fw={500}
                onClick={() => {
                    if ('Новый чат' === mobileTitle) {
                        toggle();
                    } else {
                        setMobileTitle('Новый чат');
                    }
                }}
            >
                Новый чат
            </Button>

            <div className={classes.navbarMain}>
                <ChatsList />
            </div>

            <div className={classes.footer}>
                <NavLink
                    component={Link}
                    className={classes.link}
                    label="Админ панель"
                    to='Crr183gJkwKQwkC3jE9N'
                    onClick={() => {
                        if ('Админ панель' === mobileTitle) {
                            toggle();
                        } else {
                            setMobileTitle('Админ панель');
                        }
                    }}
                    leftSection={<IconHome2 className={classes.linkIcon} stroke={1.5} />}
                />

                <NavLink
                    component={Link}
                    to='settings'
                    label="Настройки"
                    className={classes.link}
                    onClick={() => {
                        if ('Настройки' === mobileTitle) {
                            toggle();
                        } else {
                            setMobileTitle('Настройки');
                        }
                    }}

                    leftSection={<IconSettings className={classes.linkIcon} stroke={1.5} />}
                />

                <NavLink
                    component={Link}
                    to='settings'
                    label="Выйти"
                    className={classes.link}
                    onClick={() => handleLogout()}
                    leftSection={<IconLogout className={classes.linkIcon} stroke={1.5} />}
                />
            </div>
        </>
    );
}