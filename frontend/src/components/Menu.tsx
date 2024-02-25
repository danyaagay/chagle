import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Menu,
} from '@mantine/core';
import {
    IconPlus,
} from '@tabler/icons-react';
import ChatsList from './ChatsList';
import ToolsList from './ToolsList';
import UserButton from './UserButton';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import classes from '../css/ProtectedLayout.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function MobileHeader() {
    const { setMobileTitle, toggle, opened } = useMobileHeader();

    const [section, setSection] = useState<'chat' | 'tool'>('chat');
    useEffect(() => {
        setSection(window.location.pathname.startsWith('/tool') ? 'tool' : 'chat');
    }, []);

    //const navigate = useNavigate();
    const { user } = useAuth();

    const adminClick = () => {
        setMobileTitle('Админ панель');
        document.title = 'Админ панель';
        if (opened) {
            toggle();
        }
    };

    return (
        <>
            {section == 'chat' ?
                <>
                    <Button
                        component={Link}
                        to='chat'
                        rightSection={<IconPlus stroke={1.5} size={22} />}
                        className={classes.link}
                        variant="default"
                        size='sm'
                        mb={16}
                        mx={12}
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
                </>
                :
                <ToolsList />
            }

            <div className={classes.footer}>
                {user.roles[0] == 'super-admin' && (
                    <Menu
                        width={275}
                        position="top-start"
                        styles={{ item: { borderRadius: '8px' }, dropdown: { borderRadius: '8px' } }}
                    >
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
                )}

                <UserButton />
            </div>
        </>
    );
}

//<div>
//<SegmentedControl
//    value={section}
//    onChange={(value: any) => {
//        setSection(value);
//        navigate(value);
//    }}
//    onClick={(value: any) => {
//        setSection(value);
//        navigate(value);
//    }}
//    transitionTimingFunction="ease"
//    fullWidth
//    data={[
//        { label: 'Чат', value: 'chat' },
//        { label: 'Инструменты', value: 'tool' },
//    ]}
//    mx={12}
//    mb={16}
//    radius="md"
///>
//</div>