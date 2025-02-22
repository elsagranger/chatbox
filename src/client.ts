import { GPTModels, Message, ModelSetting } from './types';
import * as wordCount from './utils';
import { createParser } from 'eventsource-parser'

export interface OnTextCallbackResult {
    // response content
    text: string;
    // cancel for fetch
    cancel: () => void;
}

export async function getModels(
    modelSetting: ModelSetting,
) {
    try {
        const response = await fetch(`${modelSetting.apiHost}/v1/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${modelSetting.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json()
        const models = data.data.filter((model: { [object: string]: string }) => model.object == "model").map((model: { [id: string]: string }) => model.id)
        return models
    }
    catch (e) {
        console.log(e)
        return []
    }
}

export async function replay(
    modelSetting: ModelSetting,
    msgs: Message[],
    onText?: (option: OnTextCallbackResult) => void,
    onError?: (error: Error) => void,
) {
    if (msgs.length === 0) {
        throw new Error('No messages to replay')
    }

    const head = msgs[0].role === 'system' ? msgs[0] : undefined
    if (head) {
        msgs = msgs.slice(1)
    }

    const maxTokensNumber = Number(modelSetting.maxTokens)
    const maxLen = Number(modelSetting.maxContextSize)
    let totalLen = head ? wordCount.estimateTokens(head.content) : 0

    let prompts: Message[] = []
    for (let i = msgs.length - 1; i >= 0; i--) {
        const msg = msgs[i]
        const msgTokenSize: number = wordCount.estimateTokens(msg.content) + 200 // 200 作为预估的误差补偿
        if (msgTokenSize + totalLen > maxLen) {
            break
        }
        prompts = [msg, ...prompts]
        totalLen += msgTokenSize
    }
    if (head) {
        prompts = [head, ...prompts]
    }

    // fetch has been canceled
    let hasCancel = false;
    // abort signal for fetch
    const controller = new AbortController();
    const cancel = () => {
        hasCancel = true;
        controller.abort();
    };

    let fullText = '';
    try {
        const messages = prompts.map(msg => ({ role: msg.role, content: msg.content }))
        const response = await fetch(`${modelSetting.apiHost}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${modelSetting.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                model: modelSetting.name,
                max_tokens: maxTokensNumber,
                temperature: modelSetting.temperature,
                stream: true,
            }),
            signal: controller.signal,
        });
        await handleSSE(response, (message) => {
            if (message === '[DONE]') {
                return;
            }
            let data
            try {
                data = JSON.parse(message)
            }
            catch (e) {
                return;
            }
            if (data.type === 'error') {
                throw new Error(`${data.message}`)
            }
            const text = data.choices[0]?.delta?.content
            if (text !== undefined) {
                fullText += text
                if (onText) {
                    onText({ text: fullText, cancel })
                }
            }
        })
    } catch (error) {
        // if a cancellation is performed
        // do not throw an exception
        // otherwise the content will be overwritten.
        if (hasCancel) {
            return;
        }
        if (onError) {
            onError(error as any)
        }
        throw error
    }
    return fullText
}

export async function handleSSE(response: Response, onMessage: (message: string) => void) {
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error ? JSON.stringify(error) : `${response.status} ${response.statusText}`)
    }
    if (response.status !== 200) {
        throw new Error(`Error from OpenAI: ${response.status} ${response.statusText}`)
    }
    if (!response.body) {
        throw new Error('No response body')
    }
    const parser = createParser((event) => {
        if (event.type === 'event') {
            onMessage(event.data)
        }
    })
    for await (const chunk of iterableStreamAsync(response.body)) {
        const str = new TextDecoder().decode(chunk)
        parser.feed(str)
    }
}

export async function* iterableStreamAsync(stream: ReadableStream): AsyncIterableIterator<Uint8Array> {
    const reader = stream.getReader();
    try {
        while (true) {
            const { value, done } = await reader.read()
            if (done) {
                return
            } else {
                yield value
            }
        }
    } finally {
        reader.releaseLock()
    }
}
