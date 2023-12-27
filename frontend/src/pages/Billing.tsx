import { Center, Paper, Text, Button, Group } from '@mantine/core';

export default function Billing() {

    return (
        <Center h='100%'>
            <Paper p="xl">
                <Text>Чтобы оплатить напишите нам, ответим быстро</Text>
                <Group mt={15}>
                    <Button
                        variant="filled"
                        component="a"
                        href="https://t.me/chaglemanager"
                        target="_blank"
                    >Telegram</Button>
                </Group>
            </Paper>
        </Center>
    );
}