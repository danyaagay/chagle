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
    IconSparkles,
    IconSettings,
    IconLogout,
    IconCurrencyRubel,
    IconMail,
    IconBrandTelegram,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { useEffect, useState } from 'react';

const ModelChangeButton = () => {
    const [active, setActive] = useState('1');

    return (
        <Menu radius='md'>
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
                    Model
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item >
                    ChatGPT 3.5 Turbo
                </Menu.Item>
                <Menu.Item>
                    ChatGPT 4 Turbo
                </Menu.Item>
                <Menu.Item>
                    Claude Instant
                </Menu.Item>
                <Menu.Item>
                    Claude 2
                </Menu.Item>
                <Menu.Item>
                    Gemini Pro
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default ModelChangeButton;