import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Button,
    Menu,
    Badge
} from '@mantine/core';
import {
    IconSettings,
    IconLogout,
    IconPlus,
    IconCurrencyRubel,
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

import { forwardRef } from 'react';
import { Group, Avatar, Text, UnstyledButton, rem } from '@mantine/core';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
    name: string;
    email: string;
    icon?: React.ReactNode;
}

export default function MobileHeader() {
    const { setMobileTitle, toggle, opened } = useMobileHeader();
    const { user } = useAuth();

	function numberBalance(number:any) {
		var rounded = +number.toFixed(15); // Округляем число до 15 знаков после запятой
	  
		// Преобразуем число в строку
		var numberString = rounded.toString();
	  
		// Удаляем нули с конца строки
		while (numberString.includes('.') && (numberString.endsWith('0') || numberString.endsWith('.'))) {
		  numberString = numberString.slice(0, -1); // Удаляем последний символ
		}
	  
		return numberString;
	  }

    const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
        ({ name, email, icon, ...others }: UserButtonProps, ref) => (
            <UnstyledButton
                ref={ref}
                style={{
                    width: '100%',
                    color: 'var(--mantine-color-text)',
                    borderRadius: 'var(--mantine-radius-sm)',
                }}
                {...others}
            >
                <Group gap="xs">
                    <Avatar radius="xl" />
                    <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                                {name}
                            </Text>
    
                        <Text c="dimmed" size="xs">
                            {email}
                        </Text>
                    </div><Badge color="blue">{numberBalance(user.balance)}₽</Badge>
                </Group>
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
                <Menu width={275} position="top-start">
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

                <Menu width={275} position="top-start">
                    <Menu.Target>
                        <UserButton
                            name={user.name}
                            email={user.email}
                        />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            component={Link}
                            to='billing'
                            onClick={() => {
                                setMobileTitle('Оплата');
                                document.title = 'Оплата';
                                if (opened) {
                                    toggle();
                                }
                            }}
                            leftSection={<IconCurrencyRubel style={{ width: rem(14), height: rem(14) }} />}
                        >
                            Оплата
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