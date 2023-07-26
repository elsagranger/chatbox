
import { v4 as uuidv4 } from 'uuid';
import { OpenAIRoleEnum, OpenAIRoleEnumType, Session, Message, ModelSetting } from './types';
import { getDefaultModelSetting } from './store';

export function createMessage(role: OpenAIRoleEnumType = OpenAIRoleEnum.User, content: string = ''): Message {
    return {
        id: uuidv4(),
        content: content,
        role: role,
    }
}

export function createSession(name: string, modelSetting?: ModelSetting): Session {
    if (modelSetting === undefined) {
        modelSetting = getDefaultModelSetting()
    } else {
        modelSetting = Object.assign({}, modelSetting)
    }
    return {
        id: uuidv4(),
        name: name,
        messages: [
            {
                id: uuidv4(),
                role: 'system',
                content: modelSetting.systemMessage
            }
        ],
        modelSetting,
    }
}

