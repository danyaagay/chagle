
import {
    Slider,
    Text,
    Stack,
    Select,
    Textarea,
    Button,
    ActionIcon,
    Flex
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import {
    useEffect,
    useRef
} from 'react';
import { useForm } from '@mantine/form';
import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import axios from '../axios';
import {
    IconX
} from '@tabler/icons-react';
import classes from '../css/ProtectedLayout.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { IS_MOBILE } from '../environment/userAgent';
import { useDebouncedValue } from '@mantine/hooks';

export default function ChatSettings() {
    const { id } = useParams();
    const isMounted = useRef(false);
    const loaded = useRef<boolean>(false);
    const form = useForm({
        initialValues: {
            model: '',
            system_message: '',
            temperature: 0,
            max_tokens: 0,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0,
        },
    });
    const [debounced] = useDebouncedValue(form.values, 500);
    const { toggleSettings } = useMobileHeader();

    const { data: chats } = useQuery({
        queryKey: ['chats'],
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (chats && Array.isArray(chats)) {
            const chat = chats.find(chat => chat.id == id);
            //console.log('loading start', chat);
            const values = {
                model: chat['model'],
                system_message: chat['system_message'],
                temperature: chat['temperature'],
                max_tokens: chat['max_tokens'],
                top_p: chat['top_p'],
                frequency_penalty: chat['frequency_penalty'],
                presence_penalty: chat['presence_penalty'],
            };
            form.setValues(values);
            form.resetDirty(values);
            loaded.current = true;
        }

        isMounted.current = true;
        return () => {
            isMounted.current = false;
            form.reset();
        };
    }, [id, chats]);

    const queryClient = useQueryClient();

    const { mutate: mutationEdit } = useMutation({
        mutationFn: () => {
            return axios.patch('/chats/' + id + '/settings/update', form.values);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['chats'] });

            const previousChat = queryClient.getQueryData(['chats']);

            queryClient.setQueryData(['chats'], (oldChats: any) => {
                const updatedChats = oldChats.map((chat: any) => {
                    if (chat.id == id) {
                        return { ...chat, ...form.values };
                    }
                    return chat;
                });
                return updatedChats;
            });

            return { previousChat };
        },
        onSuccess: () => {
        },
    });

    useEffect(() => {
        //console.log(form.values, form.isDirty());
        //console.log('update start', form.isDirty(), form.isTouched());
        if (form.isDirty() && form.isTouched()) {
            if (form.values['model'] !== 'gpt-3.5-turbo-16k' && form.values['max_tokens'] > 4096) {
                //console.log('here');
                form.setFieldValue('max_tokens', 2048);
            }
            if (isMounted.current) {
                form.resetDirty(form.values);
                mutationEdit();
            }
        }
    }, [debounced]);

    return (
        <>
            {loaded.current && (
                <>
                    {IS_MOBILE ? (
                        <div className='burgerBox' style={{ marginLeft: '0' }}>
                            <button onClick={toggleSettings} className='burgerButton'></button>
                            <div className='burgerClose' />
                        </div>
                    ) : (
                        <Flex
                            mih={45}
                            gap="md"
                            justify="flex-start"
                            align="center"
                            direction="row"
                            wrap="wrap"
                            mb='16px'
                            className={classes.settingsBox}
                        >
                            <Text size='sm' fw={500}>Настройки</Text>
                            <ActionIcon style={{ marginLeft: 'auto' }} variant="transparent" size="md" color="rgba(0, 0, 0, 1)" aria-label="Settings" onClick={toggleSettings}>
                                <IconX style={{ width: '85%', height: '85%' }} stroke={1.5} />
                            </ActionIcon>
                        </Flex>
                    )}
                    <Scrollbars autoHide>
                        <Stack gap="lg" className={classes.settingsBox}>
                            <div>
                                <Select
                                    styles={{ input: { height: '45px' }, }}
                                    size='sm'
                                    radius="md"
                                    data={['gpt-3.5-turbo', 'gpt-3.5-turbo-0301', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k']}
                                    withCheckIcon={false}
                                    {...form.getInputProps('model')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Системное сообщение</Text>
                                <Textarea
                                    size='md'
                                    autosize
                                    minRows={3}
                                    radius="md"
                                    {...form.getInputProps('system_message')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Температура</Text>
                                <Slider
                                    min={0}
                                    max={2}
                                    label={(value) => value === 1.0 ? 1 : value.toFixed(1)}
                                    step={0.1}
                                    styles={{ markLabel: { display: 'none' } }}
                                    {...form.getInputProps('temperature')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Максимум токенов</Text>
                                <Slider
                                    min={0}
                                    max={form.values['model'] === 'gpt-3.5-turbo-16k' ? 16384 : 4096}
                                    step={1}
                                    styles={{ markLabel: { display: 'none' } }}
                                    {...form.getInputProps('max_tokens')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Top P</Text>
                                <Slider
                                    min={0}
                                    max={1}
                                    label={(value) => value === 1.0 ? 1 : value.toFixed(1)}
                                    step={0.1}
                                    styles={{ markLabel: { display: 'none' } }}
                                    {...form.getInputProps('top_p')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Штраф частоты</Text>
                                <Slider
                                    min={-2}
                                    max={2}
                                    label={(value) => value === 0.0 ? 0 : value.toFixed(1)}
                                    step={0.1}
                                    styles={{ markLabel: { display: 'none' } }}
                                    {...form.getInputProps('frequency_penalty')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Штраф присутствия</Text>
                                <Slider
                                    min={-2}
                                    max={2}
                                    label={(value) => value === 0.0 ? 0 : value.toFixed(1)}
                                    step={0.1}
                                    styles={{ markLabel: { display: 'none' } }}
                                    {...form.getInputProps('presence_penalty')}
                                />
                            </div>
                        </Stack>
                    </Scrollbars>
                    <div className={classes.footer}>
                        <div className={classes.settingsBox}>
                            <Button
                                variant="default"
                                fullWidth
                                radius="md"
                                onClick={() => {
                                    form.setValues({
                                        model: 'gpt-3.5-turbo',
                                        system_message: '',
                                        temperature: 0.7,
                                        max_tokens: 2048,
                                        top_p: 1.0,
                                        frequency_penalty: 0.0,
                                        presence_penalty: 0.0,
                                    });
                                    form.setFieldValue('model', 'gpt-3.5-turbo');
                                }}>
                                Сбросить
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
