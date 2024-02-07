import { Link } from 'react-router-dom';
import axios from '../axios';
import {
    Group,
    HoverCard,
    Avatar,
    Text,
    UnstyledButton,
    Flex,
    Menu,
    rem
} from '@mantine/core';
import {
    IconStarFilled,
    IconStarsFilled,
    IconPhotoFilled,
    IconSettings,
    IconLogout,
    IconCurrencyRubel,
    IconMail,
    IconBrandTelegram,
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

    return (
        <Menu
            width={275}
            position="top-start"
            styles={{ item: { borderRadius: '8px' }, dropdown: { borderRadius: '8px' } }}
        >
            <Menu.Target>
                <UnstyledButton
                    px={12}
                    py={10}
                    style={{
                        width: '100%',
                        color: 'var(--mantine-color-text)',
                        borderRadius: 'var(--mantine-radius-md)',
                    }}
                >
                    <Flex gap="xs" align="center">
                        <Avatar radius="xl" />
                        <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                                {user.name}
                            </Text>
                            <Text c="dimmed" size="xs">
                                {user.email}
                            </Text>
                        </div>
                        <div style={{ flex: 1 }}>
                            <HoverCard radius="md">
                                <HoverCard.Target>
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
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                    <Group gap={5}>
                                        <div>
                                            <IconStarFilled size={14} style={{
                                                color: "rgb(34, 139, 230)",
                                            }} />
                                            <Text size="sm">
                                                ChatGPT 3.5, Claude Instant, Gemini Pro
                                            </Text>
                                        </div>
                                        <Text size="sm" style={{
                                            marginLeft: "auto",
                                        }}>
                                            {user.quick}
                                        </Text>
                                    </Group>
                                    <Group gap={5}>
                                        <div>
                                            <IconStarsFilled size={14} style={{
                                                color: "rgb(34, 139, 230)",
                                            }} />
                                            <Text size="sm">
                                                ChatGPT 4, Claude 2
                                            </Text>
                                        </div>
                                        <Text size="sm" style={{
                                            marginLeft: "auto",
                                        }}>
                                            {user.extended}
                                        </Text>
                                    </Group>
                                    <Group gap={5}>
                                        <div>
                                            <IconPhotoFilled size={14} style={{
                                                color: "rgb(34, 139, 230)",
                                            }} />
                                            <Text size="sm">
                                                Midjourney
                                            </Text>
                                        </div>
                                        <Text size="sm" style={{
                                            marginLeft: "auto",
                                        }}>
                                            {user.images}
                                        </Text>
                                    </Group>
                                </HoverCard.Dropdown>
                            </HoverCard>
                        </div>
                    </Flex>
                </UnstyledButton>
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
    );
};

export default UserButton;