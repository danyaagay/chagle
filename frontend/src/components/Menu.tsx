import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Burger,
    useMantineTheme,
    Button,
    NavLink,
    Menu
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

    const adminClick = () => {
        if ('Админ панель' === mobileTitle) {
            toggle();
        } else {
            setMobileTitle('Админ панель');
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

            <ChatsList />

            <div className={classes.footer}>
                <Menu width={200} shadow="md" position="left" offset={-80}>
                    <Menu.Target>
                        <NavLink
                            className={classes.link}
                            label="Админ панель"
                            leftSection={<IconHome2 className={classes.linkIcon} stroke={1.5} />}
                        />
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item component={Link} to='Crr183gJkwKQwkC3jE9N' onClick={adminClick}>
                            Сводка
                        </Menu.Item>
                        <Menu.Item component={Link} to='Crr183gJkwKQwkC3jE9N/users' onClick={adminClick}>
                            Клиенты
                        </Menu.Item>
                        <Menu.Item component={Link} to='Crr183gJkwKQwkC3jE9N/tokens' onClick={adminClick}>
                            Токены
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

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