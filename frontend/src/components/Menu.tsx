import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Button,
    Menu,
    Badge,
    HoverCard,
    Group,
    Grid
} from '@mantine/core';
import {
    IconSettings,
    IconLogout,
    IconPlus,
    IconCurrencyRubel,
    IconStarFilled,
    IconMail,
    IconBrandTelegram
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

import { forwardRef } from 'react';
import { Avatar, Text, UnstyledButton, rem, Flex } from '@mantine/core';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    name: string;
    icon?: React.ReactNode;
}

export default function MobileHeader() {
    const { setMobileTitle, toggle, opened } = useMobileHeader();
    const { user } = useAuth();

    const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
        ({ name, icon, ...others }: UserButtonProps, ref) => (
            <UnstyledButton
                ref={ref}
                px={12}
                py={10}
                style={{
                    width: '100%',
                    color: 'var(--mantine-color-text)',
                    borderRadius: 'var(--mantine-radius-md)',
                }}
                {...others}
            >
                <Flex gap="xs" align="center">
                    <Avatar radius="xl" />
                    <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>
                            {name}
                        </Text>
                        <Text c="dimmed" size="xs">
                            {user.email}
                        </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Group gap={5}>
                            <Text size="sm" style={{
                                marginLeft: "auto",
                            }}>
                                {user.quick}
                            </Text>
                            <IconStarFilled size={14} style={{
                                color: "rgb(34, 139, 230)",
                            }} />
                        </Group>
                    </div>

                </Flex>
            </UnstyledButton>
        )
    );

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
                rightSection={<IconPlus stroke={1.5} size={22} />}
                className={classes.link}
                variant="default"
                fullWidth
                size='sm'
                mb='16px'
                fw={500}
                radius="md"
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
                <Menu
                    width={275}
                    position="top-start"
                    styles={{ item: { borderRadius: '8px' }, dropdown: { borderRadius: '8px' } }}
                >
                    {user.roles[0] == 'super-admin' && (
                        <Menu.Target>
                            <Button
                                variant="default"
                                fullWidth
                                mb='16px'
                                radius="md"
                            >
                                Админ панель
                            </Button>
                        </Menu.Target>
                    )}

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
                        <Menu.Item component={Link} to='Crr183gJkwKQwkC3jE9N/proxy' onClick={adminClick}>
                            Прокси
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                <Menu
                    width={275}
                    position="top-start"
                    styles={{ item: { borderRadius: '8px' }, dropdown: { borderRadius: '8px' } }}
                >
                    <Menu.Target>
                        <UserButton
                            name={user.name}
                            className={classes.user}
                        />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            component={Link}
                            to='https://t.me/chaglemanager'
                            target="_blank"
                            leftSection={<IconCurrencyRubel style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Оплата
                        </Menu.Item>
                        <Menu.Item
                            component={Link}
                            to='https://t.me/chaglebot'
                            target="_blank"
                            leftSection={<IconBrandTelegram style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Telegram бот
                        </Menu.Item>
                        <Menu.Item
                            component={Link}
                            to='https://t.me/chaglemanager'
                            target="_blank"
                            leftSection={<IconMail style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Обратная связь
                        </Menu.Item>
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