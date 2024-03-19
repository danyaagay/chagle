
import {
    Text,
    Stack,
    Select,
    Textarea,
    Button,
    ActionIcon,
    Flex,
    SegmentedControl
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
    IconX,
    IconChevronDown
} from '@tabler/icons-react';
import classes from '../css/ProtectedLayout.module.css';
import { Scrollbars } from 'react-custom-scrollbars';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { IS_MOBILE } from '../environment/userAgent';
import { useDebouncedValue } from '@mantine/hooks';
import { produce } from 'immer';
import { useAuth } from '../contexts/AuthContext';

export default function ChatSettings() {
    const { user } = useAuth();
    const { id } = useParams();
    const isMounted = useRef(false);
    const loaded = useRef<boolean>(false);
    const form = useForm({
        initialValues: {
            model: 'gpt-3.5-turbo',
            system_message: '',
            max_tokens: '2048',
            history: '1',
        },
    });
    const [debounced] = useDebouncedValue(form.values, 500);
    const { toggleSettings } = useMobileHeader();

    const { data: chats }: any = useQuery({
        queryKey: ['chats'],
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const allItems: any = chats?.pages?.flatMap((page: any) => page.chats);

        if (allItems && Array.isArray(allItems)) {
            const chat = allItems.find(chat => chat.id == id);
            //console.log('loading start', chat);

            if (chat) {
                const values = {
                    model: chat['model'],
                    system_message: chat['system_message'],
                    max_tokens: `${chat['max_tokens']}`,
                    history: `${chat['history']}`,
                };
                form.setValues(values);
                form.resetDirty(values);
                loaded.current = true;
            }
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

            queryClient.setQueryData(['chats'],
                (oldData: any) => {
                    if (oldData) {
                        return produce(oldData, (draft: any) => {
                            draft.pages.forEach((page: any) => {
                                page.chats.forEach((chat: any) => {
                                    if (chat.id == id) {
                                        chat.model = form.values.model;
                                        chat.history = form.values.history;
                                        chat.max_tokens = form.values.max_tokens;
                                        chat.system_message = form.values.system_message;
                                    }
                                });
                            });
                        });
                    }
                    return oldData;
                }
            );

            return { previousChat };
        },
        onSuccess: () => {
        },
    });

    useEffect(() => {
        //console.log(form.values, form.isDirty());
        //console.log('update start', form.isDirty(), form.isTouched());
        if (form.isDirty() && form.isTouched()) {
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
                    <div style={{ textAlign: 'right', padding: "0 8px 0 8px", marginBottom: "5px" }}>
                        {IS_MOBILE ? (
                            <ActionIcon
                                variant="transparent"
                                size="md"
                                color="#868e96"
                                aria-label="Settings"
                                onClick={toggleSettings}
                                ml="auto"
                                miw={40}
                                mih="100%"
                            >
                                <IconX style={{ width: 24, height: 24 }} stroke={1.8} />
                            </ActionIcon>

                        ) : (
                            <Flex
                                mih={45}
                                gap="md"
                                justify="flex-start"
                                align="center"
                                direction="row"
                                wrap="wrap"
                                px="21px"
                                mb='16px'
                            >
                                <Text size='sm' fw={500}>Настройки</Text>
                                <ActionIcon style={{ marginLeft: 'auto' }} variant="transparent" size="md" color="rgba(0, 0, 0, 1)" aria-label="Settings" onClick={toggleSettings}>
                                    <IconX style={{ width: 24, height: 24 }} stroke={1.5} />
                                </ActionIcon>
                            </Flex>
                        )}
                    </div>
                    <Scrollbars autoHide>
                        <Stack gap="lg" className={classes.settingsBox}>
                            <div>
                                <Select
                                    styles={{ input: { height: '45px' }, dropdown: { borderRadius: '8px' }, option: { borderRadius: '8px' } }}
                                    size='sm'
                                    radius="md"
                                    data={[
                                        { value: 'gpt-3.5-turbo', label: 'GPT 3.5 Turbo' },
                                        { value: 'gpt-3.5-turbo-16k', label: 'GPT 3.5 Turbo 16k' },
                                        { value: 'openai/gpt-4', label: 'GPT 4', disabled: user.level < 2 },
                                        { value: 'openai/gpt-4-32k', label: 'GPT 4 32k', disabled: user.level < 2 },
                                        { value: 'openai/gpt-4-turbo-preview', label: 'GPT 4 Turbo', disabled: user.level < 2 },
                                        { value: 'anthropic/claude-instant-1', label: 'Claude Instant' },
                                        { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', disabled: user.level < 2 },
                                        { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', disabled: user.level < 2 },
                                        { value: 'google/gemini-pro', label: 'Gemini Pro' },
                                    ]}
                                    withCheckIcon={false}
                                    rightSection={<IconChevronDown style={{ width: 16, height: 16 }}  />}
                                    {...form.getInputProps('model')}
                                />
                                {user.level < 2 && <Text size="xs" mt={5} c="dimmed">Для использования недоступных моделей оплатите аккаунт</Text>}
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
                                <Text size='sm' fw={500} mb={8} c='gray.7'>Длина ответа</Text>
                                <SegmentedControl
                                    fullWidth
                                    radius="md"
                                    data={[
                                        { value: '500', label: 'Короткая' },
                                        { value: '2048', label: 'Средняя' },
                                        { value: '4096', label: 'Длинная' },
                                    ]}
                                    {...form.getInputProps('max_tokens')}
                                />
                            </div>
                            <div>
                                <Text size='sm' fw={500} mb={8} c='gray.7'>История чата</Text>
                                <SegmentedControl
                                    fullWidth
                                    radius="md"
                                    data={[
                                        { value: '1', label: 'Учитывать' },
                                        { value: '0', label: 'Не учитывать' },
                                    ]}
                                    {...form.getInputProps('history')}
                                />
                            </div>
                        </Stack>
                    </Scrollbars>
                    <div className={classes.settingsFooter}>
                        <Button
                            variant="default"
                            fullWidth
                            radius="md"
                            onClick={() => {
                                form.setValues({
                                    model: 'gpt-3.5-turbo',
                                    system_message: '',
                                    max_tokens: '2048',
                                    history: '1'
                                });
                                form.setFieldValue('model', 'gpt-3.5-turbo');
                            }}>
                            Сбросить
                        </Button>

                    </div>
                </>
            )}
        </>
    );
}
