
import {
    Slider,
    Text,
    Stack,
    Select,
    Textarea,
    Button
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

export default function ChatSettings() {
    const { id } = useParams();
    const isMounted = useRef(false);
    const timeoutRef = useRef<number>();
    const loaded = useRef<boolean>(false);
    const form = useForm();

    const { data: chats } = useQuery({
        queryKey: ['chats'],
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (chats && Array.isArray(chats)) {
            const chat = chats.find(chat => chat.id == id);
            console.log('loading start', chat);
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
            clearTimeout(timeoutRef.current);
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
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                if (isMounted.current) {
                    form.resetDirty(form.values);
                    mutationEdit();
                }
            }, 500)
        }
    }, [form.values]);

    return (
        <>
            {loaded.current && (
                <Stack gap="lg">
                    <div>
                        <Text>Модель</Text>
                        <Select
                            name="model"
                            data={['gpt-3.5-turbo', 'gpt-3.5-turbo-0301', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k']}
                            {...form.getInputProps('model')}
                        />
                    </div>
                    <div>
                        <Text>Системное сообщение</Text>
                        <Textarea
                            autosize
                            minRows={3}
                            {...form.getInputProps('system_message')}
                        />
                    </div>
                    <div>
                        <Text>Температура</Text>
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
                        <Text>Максимум токенов</Text>
                        <Slider
                            min={0}
                            max={4096}
                            step={1}
                            styles={{ markLabel: { display: 'none' } }}
                            {...form.getInputProps('max_tokens')}
                        />
                    </div>
                    <div>
                        <Text>Top P</Text>
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
                        <Text>Штраф частоты</Text>
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
                        <Text>Штраф присутствия</Text>
                        <Slider
                            min={-2}
                            max={2}
                            label={(value) => value === 0.0 ? 0 : value.toFixed(1)}
                            step={0.1}
                            styles={{ markLabel: { display: 'none' } }}
                            {...form.getInputProps('presence_penalty')}
                        />
                    </div>
                    <Button variant="light" onClick={() => form.setValues({
                        model: 'gpt-3.5-turbo',
                        system_message: '',
                        temperature: 0.7,
                        max_tokens: 1024,
                        top_p: 1.0,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.0,
                    })}>Сбросить</Button>
                </Stack>
            )}
        </>
    );
}
