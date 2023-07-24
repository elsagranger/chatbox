
import { v4 as uuidv4 } from 'uuid';
import { OpenAIRoleEnum, OpenAIRoleEnumType, Session, Message } from './types';
import { getDefaultModelSetting } from './store';

export function createMessage(role: OpenAIRoleEnumType = OpenAIRoleEnum.User, content: string = ''): Message {
    return {
        id: uuidv4(),
        content: content,
        role: role,
    }
}

export function createSession(name: string = "Untitled"): Session {
    return {
        id: uuidv4(),
        name: name,
        messages: [
            {
                id: uuidv4(),
                role: 'system',
                content: 'You are a helpful assistant. You can help me by answering my questions. You can also ask me questions.'
            }
        ],
        model: getDefaultModelSetting(),
    }
}

