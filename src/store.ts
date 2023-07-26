import { useState, useEffect, useRef } from 'react'
import { Settings, Session, Message, Config, ModelSetting } from './types'
import * as defaults from './defaults'
import { v4 as uuidv4 } from 'uuid';
import { ThemeMode } from './theme';
import * as api from './api'
import { useTranslation } from "react-i18next";
import { createSession } from './session';

// setting store

export const defaultSessionName: string = "Untitled"

export function getDefaultModelSetting(): ModelSetting {
    return {
        name: 'gpt-3.5-turbo',
        apiKey: '',
        apiHost: 'https://api.openai.com',
        maxContextSize: "4000",
        temperature: 0.7,
        maxTokens: "2048",
        systemMessage: "You are a helpful assistant. You can help me by answering my questions. You can also ask me questions.",
    }
}

export function getDefaultSettings(): Settings {
    return {
        modelSetting: getDefaultModelSetting(),
        showWordCount: false,
        showTokenCount: false,
        showModelName: false,
        theme: ThemeMode.System,
        language: 'en',
        fontSize: 13,
    }
}

export async function readSettings(): Promise<Settings> {
    const setting: Settings | undefined = await api.readStore('settings')
    if (!setting) {
        return getDefaultSettings()
    }
    // 兼容早期版本
    const settingWithDefaults = Object.assign({}, getDefaultSettings(), setting);

    return settingWithDefaults;
}

export async function writeSettings(settings: Settings) {
    if (!settings.modelSetting.apiHost) {
        settings.modelSetting.apiHost = getDefaultSettings().modelSetting.apiHost
    }
    console.log('writeSettings.apiHost', settings.modelSetting.apiHost)
    return api.writeStore('settings', settings)
}

export async function readConfig(): Promise<Config> {
    let config: Config | undefined = await api.readStore('configs')
    if (!config) {
        config = { uuid: uuidv4() }
        await api.writeStore('configs', config)
    }
    return config;
}

export async function writeConfig(config: Config) {
    return api.writeStore('configs', config)
}

// session store

export async function readSessions(settings: Settings): Promise<Session[]> {
    let sessions: Session[] | undefined = await api.readStore('chat-sessions')
    if (!sessions || sessions.length === 0) {
        return [createSession(defaultSessionName, settings.modelSetting)]
    }
    return sessions.map((s: any) => {
        // 兼容旧版本的数据
        if (!s.model) {
            s.model = getDefaultSettings().modelSetting
        }
        return s
    })
}

export async function writeSessions(sessions: Session[]) {
    return api.writeStore('chat-sessions', sessions)
}

// react hook

export default function useStore() {
    const { i18n } = useTranslation();

    const [version, _setVersion] = useState('unknown')
    const [needCheckUpdate, setNeedCheckUpdate] = useState(false)
    const updateCheckTimer = useRef<NodeJS.Timeout>()

    const [settings, _setSettings] = useState<Settings>(getDefaultSettings())
    useEffect(() => {
        readSettings().then((settings) => {
            _setSettings(settings)
            i18n.changeLanguage(settings.language).then();
        })
    }, [])
    const setSettings = (settings: Settings) => {
        _setSettings(settings)
        writeSettings(settings)
        i18n.changeLanguage(settings.language).then();
    }

    const [chatSessions, _setChatSessions] = useState<Session[]>([createSession(defaultSessionName, settings.modelSetting)])

    const findNonConflictSessionName = () => {
        const names = chatSessions.map((s) => s.name)
        if (!names.includes(defaultSessionName)) {
            return defaultSessionName
        }
        let i = 1
        while (true) {
            const name = `${defaultSessionName} (${i})`
            if (!names.includes(name)) {
                return name
            }
            i++
        }
    }

    const [currentSession, switchCurrentSession] = useState<Session>(chatSessions[0])
    useEffect(() => {
        readSessions(settings).then((sessions: Session[]) => {
            _setChatSessions(sessions)
            switchCurrentSession(sessions[0])
        })
    }, [])
    const setSessions = (sessions: Session[]) => {
        _setChatSessions(sessions)
        writeSessions(sessions)
    }

    const deleteChatSession = (target: Session) => {
        const sessions = chatSessions.filter((s) => s.id !== target.id)
        if (sessions.length === 0) {
            sessions.push(createSession(defaultSessionName, settings.modelSetting))
        }
        if (target.id === currentSession.id) {
            switchCurrentSession(sessions[0])
        }
        setSessions(sessions)
    }
    const updateChatSession = (session: Session) => {
        const sessions = chatSessions.map((s) => {
            if (s.id === session.id) {
                return session
            }
            return s
        })
        setSessions(sessions)
        if (session.id === currentSession.id) {
            switchCurrentSession(session)
        }
    }
    const createChatSession = (session: Session, ix?: number) => {
        const sessions = [...chatSessions, session]
        setSessions(sessions)
        switchCurrentSession(session)
    }
    const createEmptyChatSession = () => {
        createChatSession(createSession(findNonConflictSessionName(), settings.modelSetting))
    }

    const setMessages = (session: Session, messages: Message[]) => {
        updateChatSession({
            ...session,
            messages,
        })
    }

    const [toasts, _setToasts] = useState<{ id: string, content: string }[]>([])
    const addToast = (content: string) => {
        const id = uuidv4()
        _setToasts([...toasts, { id, content }])
    }
    const removeToast = (id: string) => {
        _setToasts(toasts.filter((t) => t.id !== id))
    }

    return {
        version,
        needCheckUpdate,

        settings,
        setSettings,

        chatSessions,
        createChatSession,
        updateChatSession,
        deleteChatSession,
        createEmptyChatSession,

        setSessions,
        currentSession,
        switchCurrentSession,

        toasts,
        addToast,
        removeToast,
    }
}
