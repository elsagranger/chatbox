import { ThemeMode } from './theme';

export type Message = OpenAIMessage & {
    id: string;
    cancel?: () => void;
    generating?: boolean
    model?: string
}

export interface ModelSetting {
    name: string,
    apiHost: string
    apiKey?: string
    maxContextSize: string
    temperature: number
    maxTokens: string
    needFormatPrompt: boolean
    systemMessage: string
}

export interface Session {
    id: string
    name: string
    messages: Message[]
    starred?: boolean
    model: ModelSetting
}

export interface Settings {
    showWordCount?: boolean
    showTokenCount?: boolean
    showModelName?: boolean
    theme: ThemeMode
    language: string
    fontSize: number
    modelConfig: ModelSetting
}

export const OpenAIRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
} as const;

export type OpenAIRoleEnumType = typeof OpenAIRoleEnum[keyof typeof OpenAIRoleEnum]

export interface OpenAIMessage {
    'role': OpenAIRoleEnumType
    'content': string;
    'name'?: string;
}

export interface Config {
    uuid: string
}

export interface SponsorAd {
    text: string
    url: string
}

export interface SponsorAboutBanner {
    type: 'picture' | 'picture-text'
    name: string
    pictureUrl: string
    link: string
    title: string
    description: string
}

export const GPTModels: string[] = ['gpt-3.5-turbo', 'gpt-3.5-turbo-0301', 'gpt-4', 'gpt-4-0314', 'gpt-4-32k', 'gpt-4-32k-0314'];
