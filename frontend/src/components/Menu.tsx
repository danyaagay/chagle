import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../axios';
import {
    Burger,
    useMantineTheme,
    Button,
} from '@mantine/core';
import {
    IconSettings,
    IconLogout,
    IconPlus,
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';

export default function MobileHeader() {
    const { setMobileTitle, opened, toggle } = useMobileHeader();
    const navigate = useNavigate();
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
                leftSection={<IconPlus />}
                className={classes.link}
                variant="default"
                fullWidth
                size='sm'
                mb='16px'
                fw={500}
                onClick={() => {
                    navigate('chat');
                    setMobileTitle('Новый чат');
                }}
            >
                Новый чат
            </Button>

            <div className={classes.navbarMain}>
                <ChatsList />
            </div>

            <div className={classes.footer}>
                <NavLink
                    to='settings'
                    className={classes.link}
                    onClick={() => {
                        setMobileTitle('Настройки');
                    }}
                >
                    <IconSettings className={classes.linkIcon} stroke={1.5} />
                    <span>Настройки</span>
                </NavLink>

                <a href="#" className={classes.link} onClick={() => handleLogout()}>
                    <IconLogout className={classes.linkIcon} stroke={1.5} />
                    <span>Выйти</span>
                </a>
            </div>
        </>
    );
}