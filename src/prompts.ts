import { Message } from './types'

export function nameConversation(msgs: Message[]): Message[] {
    const format = (msgs: string[]) => msgs.slice(1,).map((msg, idx) => ["user: ", "assisant: "][idx % 2] + msg).join('\n\n')
    return [
        {
            id: '1',
            role: 'system',
            content: "You are a expert in naming conversations based on the chat records",
        },
        {
            id: '2',
            role: 'user',
            content: `Please name the conversation based on the chat records.
Please provide a concise name, within 10 characters and without quotation marks.
Please use the speak language in the conversation.
You only need to answer with the name.

${format(msgs.map(msg => msg.content))}
`
        }
    ]
}
