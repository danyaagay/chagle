import classes from '../css/ProtectedLayout.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IS_MOBILE } from '../environment/userAgent';

const ToolList = () => {
    const [active, setActive]: any = useState('');

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/tool/');
        if (pathSegments.length > 1) {
            console.log(pathSegments[1]);
            setActive(pathSegments[1]);
        }
    }, []);

    useEffect(() => {
        if (window.location.pathname === '/tool') {
            setActive('');
        }
    }, [window.location.pathname]);

    const tools = [
        { link: '', label: 'Перефразирование', col: 'Текст', url: 'improve' },
        { link: '', label: 'Грамматика', url: 'grammar' },
        { link: '', label: 'Перевод' },
        { link: '', label: 'Сокращение' },
        { link: '', label: 'Расширение' },
        { link: '', label: 'Свободное', col: 'Изображение' },
        { link: '', label: 'Логотип' },
        { link: '', label: 'Дизайн' },
        { link: '', label: 'Иконки' },
    ];

    const navigate = useNavigate();

    const tools_links = tools.map((item) => (
        <div key={item.label}>
            {item.col &&
                <Text size="sm" fw={500} c="dimmed" my='5px' mx={18}>
                    {item.col}
                </Text>
            }
            <a
                className={`${IS_MOBILE ? classes.chatLinkMobile : classes.chatLink} ${item.url === active ? classes.chatLinkActive : ''}`}
                onClick={(event) => {
                    event.preventDefault();
                    navigate('/tool/' + item.url);
                    setActive(item.url);
                }}
            >
                <span>{item.label}</span>
            </a>
        </div>
    ));

    return (
        <div className={classes.navbarMain}>
            <Scrollbars autoHide>
                {tools_links}
            </Scrollbars>
        </div>
    );
};

export default ToolList;