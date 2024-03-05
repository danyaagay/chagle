import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Group,
    Avatar,
    Text,
    UnstyledButton,
    Button,
    Flex,
    Menu,
    rem
} from '@mantine/core';
import {
    IconSparkles,
    IconSettings,
    IconLogout,
    IconCurrencyRubel,
    IconMail,
    IconBrandTelegram,
    IconList,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useMobileHeader } from '../contexts/MobileHeaderContext';

const UserButton = () => {
    const { user } = useAuth();
    const { setMobileTitle, toggle, opened } = useMobileHeader();

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

    function numberBalance(number: any) {
        number = Number(number);
        var rounded = +number.toFixed(15); // Округляем число до 15 знаков после запятой

        // Преобразуем число в строку
        var numberString = rounded.toString();

        // Удаляем нули с конца строки
        while (numberString.includes('.') && (numberString.endsWith('0') || numberString.endsWith('.'))) {
            numberString = numberString.slice(0, -1); // Удаляем последний символ
        }

        return numberString;
    }

    return (
        <Menu
            width={275}
            position="top-start"
            styles={{ item: { borderRadius: '8px' }, dropdown: { borderRadius: '8px' } }}
        >
            <Menu.Target>
                <Button
                    px={12}
                    py={10}
                    variant="subtle"
                    size="md"
                    color="gray"
                    styles={{ label: { display: 'block'}, inner: { display: 'block'} }}
                    style={{
                        width: '100%',
                        color: 'var(--mantine-color-text)',
                        borderRadius: 'var(--mantine-radius-md)',
                        height: 'auto'
                    }}
                >
                    <Flex gap="xs" align="center">
                        <Avatar radius="xl" />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <Text size="sm" fw={500}>
                                {user.name}
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
                                    {numberBalance(user.balance)}
                                </Text>
                                <IconSparkles size={20} style={{
                                    color: "rgb(34, 139, 230)",
                                }} stroke={2} />
                            </Group>
                        </div>
                    </Flex>
                </Button>
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
                    to='transactions'
                    onClick={() => {
                        if (opened) {
                            toggle();
                        }
                        setMobileTitle("История использования");
                        document.title = "История использования";
                    }}
                    leftSection={<IconList style={{ width: rem(14), height: rem(14) }} />}
                >
                    История использования
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
                        if (opened) {
                            toggle();
                        }
                        setMobileTitle("Настройки");
                        document.title = "Настройки";
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
    );
};

export default UserButton;