import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Button,
    Menu
} from '@mantine/core';
import {
    IconSettings,
    IconLogout,
    IconPlus,
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

import { forwardRef } from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { Group, Avatar, Text, UnstyledButton, rem } from '@mantine/core';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    image: string;
    name: string;
    email: string;
    icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
    ({ image, name, email, icon, ...others }: UserButtonProps, ref) => (
        <UnstyledButton
            ref={ref}
            style={{
                width: '100%',
                color: 'var(--mantine-color-text)',
                borderRadius: 'var(--mantine-radius-sm)',
            }}
            {...others}
        >
            <Group>
                <Avatar src={image} radius="xl" />

                <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                        {name}
                    </Text>

                    <Text c="dimmed" size="xs">
                        {email}
                    </Text>
                </div>
            </Group>
        </UnstyledButton>
    )
);

export default function MobileHeader() {
    const { setMobileTitle, toggle, opened } = useMobileHeader();
    const { user } = useAuth();

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
        setMobileTitle('Админ панель');
        document.title = 'Админ панель';
        if (opened) {
            toggle();
        }
    };

    return (
        <>
            <div className='burgerBox'>
                <button onClick={toggle} className='burgerButton'></button>
                <div
                    className='burgerClose'
                />
            </div>

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
                    setMobileTitle('Новый чат');
                    document.title = 'Новый чат';
                    if (opened) {
                        toggle();
                    }
                }}
            >
                Новый чат
            </Button>

            <ChatsList />

            <div className={classes.footer}>
                <Menu width={275}>
                    <Menu.Target>
                        <Button
                            variant="default"
                            fullWidth
                            mb='16px'
                        >
                            Админ панель
                        </Button>
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

                <Menu width={275}>
                    <Menu.Target>
                        <UserButton
                            image="#"
                            name={user.name}
                            email={user.email}
                        />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            component={Link}
                            to='settings'
                            onClick={() => {
                                setMobileTitle('Настройки');
                                document.title = 'Настройки';
                                if (opened) {
                                    toggle();
                                }
                            }}
                            leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Настройки
                        </Menu.Item>
                        <Menu.Item
                            color='red'
                            onClick={() => handleLogout()}
                            leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Выйти
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </div>
        </>
    );
}