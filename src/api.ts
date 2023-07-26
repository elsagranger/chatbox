
export const writeStore = async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const readStore = async (key: string): Promise<any | undefined> => {
    const value = localStorage.getItem(key)
    if (value) {
        return JSON.parse(value)
    }
    return undefined
}

export const shouldUseDarkColors = async (): Promise<boolean> => {
    return false
}

export async function onSystemThemeChange(callback: () => void) {
    return () => { }
}

export const getVersion = async () => {
    return '1.0'
}

export const openLink = async (url: string) => {
}

export const getPlatform = async () => {
}