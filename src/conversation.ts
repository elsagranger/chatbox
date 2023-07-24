import { Message, ModelSetting, GPTModels } from "./types";

enum SeparatorStyle {
    ADD_COLON_SINGLE,
    ADD_COLON_TWO,
    ADD_COLON_SPACE_SINGLE,
    NO_COLON_SINGLE,
    NO_COLON_TWO,
    ADD_NEW_LINE_SINGLE,
    LLAMA2,
    CHATGLM,
    CHATML,
    CHATINTERN,
    DOLLY,
    RWKV,
    PHOENIX,
    ROBIN
}

class Conversation {

    // The name of this template
    name: string;

    // The system prompt containing a placeholder
    system: string;

    // Two roles
    roles: string[];

    // Is chat mode when POST
    chat: boolean;

    // Separators
    sepStyle: SeparatorStyle;
    sep: string;
    sep2?: string;

    // Stop criteria (the default one is EOS token)
    stopStr?: string;

    // Stops generation if meeting any token in this list
    stopTokenIds?: number[];

    constructor(name: string, system: string, roles: string[], chat: boolean, sepStyle: SeparatorStyle, sep: string, sep2?: string, stopStr?: string, stopTokenIds?: number[]) {
        this.name = name;
        this.system = system;
        this.roles = roles;
        this.chat = chat;
        this.sepStyle = sepStyle;
        this.sep = sep;
        this.sep2 = sep2;
        this.stopStr = stopStr;
        this.stopTokenIds = stopTokenIds;
    }

    getPrompt(messages: Message[]) {
        let msgs: Message[]
        let systemPrompt
        if (messages[0].role == "system") {
            systemPrompt = this.system.replace("{{system_message_content}}", messages[0].content);
            msgs = messages.slice(1);
        } else {
            msgs = messages;
        }

        if (this.sepStyle === SeparatorStyle.ADD_COLON_SINGLE) {
            let prompt = systemPrompt + this.sep;
            for (let msg of msgs) {
                prompt += msg.role + ": " + msg.content + this.sep;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.ADD_COLON_TWO) {
            const seps = [this.sep, this.sep2!];
            let prompt = systemPrompt + seps[0];

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                prompt += msg.role + ": " + msg.content + seps[i % 2];
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.ADD_COLON_SPACE_SINGLE) {
            let prompt = systemPrompt + this.sep;
            for (let msg of msgs) {
                prompt += msg.role + ": " + (msg.content || " ") + this.sep;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.NO_COLON_SINGLE) {
            let prompt = systemPrompt;
            for (let msg of msgs) {
                prompt += msg.role + msg.content + this.sep;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.NO_COLON_TWO) {
            const seps = [this.sep, this.sep2!];
            let prompt = systemPrompt;

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                prompt += msg.role + msg.content + seps[i % 2];
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.ADD_NEW_LINE_SINGLE) {
            let prompt = systemPrompt ? systemPrompt + this.sep : '';
            for (let msg of msgs) {
                prompt += msg.role + '\n' + msg.content + this.sep;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.RWKV) {
            let prompt = systemPrompt;
            for (let msg of msgs) {
                prompt += msg.role + ": " + msg.content.replace(/\r\n/g, '\n').replace(/\n\n/g, '\n') + '\n\n';
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.LLAMA2) {
            const seps = [this.sep, this.sep2!];
            let prompt = "";

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                if (i === 0) {
                    prompt += systemPrompt + msg.content;
                } else {
                    prompt += msg.role + " " + msg.content + seps[i % 2];
                }
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.CHATGLM) {
            const roundAddN = this.name === "chatglm2" ? 1 : 0;
            let prompt = systemPrompt ? systemPrompt + this.sep : "";

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                if (i % 2 === 0) {
                    prompt += `[Round ${i / 2 + roundAddN}]${this.sep}`;
                }
                prompt += `${msg.role}:${msg.content || ""}${this.sep}`;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.CHATML) {
            let prompt = systemPrompt ? systemPrompt + this.sep + '\n' : '';

            for (let msg of msgs) {
                prompt += msg.role + '\n' + (msg.content || '') + this.sep + '\n';
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.CHATINTERN) {
            const seps = [this.sep, this.sep2!];
            let prompt = systemPrompt;

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                if (i % 2 === 0) {
                    prompt += "<s>";
                }
                prompt += `${msg.role}:${msg.content || ""}${seps[i % 2]}\n`;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.DOLLY) {
            const seps = [this.sep, this.sep2!];
            let prompt = systemPrompt;

            for (let i = 0; i < msgs.length; i++) {
                const msg = msgs[i];
                prompt += `${msg.role}:\n${msg.content || ""}${seps[i % 2]}`;
                if (i % 2 === 1) {
                    prompt += '\n\n';
                }
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.PHOENIX) {
            let prompt = systemPrompt;

            for (let msg of msgs) {
                prompt += `${msg.role}: <s>${msg.content || ""}</s>`;
            }
            return prompt;
        } else if (this.sepStyle === SeparatorStyle.ROBIN) {
            let prompt = systemPrompt + this.sep;

            for (let msg of msgs) {
                prompt += `${msg.role}:\n${msg.content || ""}${this.sep}`;
            }
            return prompt;
        } else {
            throw new Error(`Invalid style: ${this.sepStyle}`);
        }
    }

    copy() {
        return new Conversation(
            this.name,
            this.system,
            this.roles,
            this.chat,
            this.sepStyle,
            this.sep,
            this.sep2,
            this.stopStr,
            this.stopTokenIds
        );
    }

    config() {
        return {
            template_name: this.name,
            system: this.system,
        };
    }
}

let CONVERSATION_TEMPLATES: { [key: string]: Conversation } = {};

function registerTemplate(template: Conversation) {
    CONVERSATION_TEMPLATES[template.name] = template;
}

export function getConversationTemplate(name: string) {
    if (GPTModels.includes(name)) {
        return CONVERSATION_TEMPLATES["gpt"];
    }
    return CONVERSATION_TEMPLATES[name];
}

registerTemplate(new Conversation(
    "gpt", // name
    "",  // system
    [], // roles
    true, // chat
    SeparatorStyle.LLAMA2, // sepStyle
    "", // sep
    "", // sep2
    "",  // stopStr
    [],  // stopTokenIds
))

registerTemplate(new Conversation(
    "llama-2", // name
    "<s>[INST] <<SYS>>{{system_message_content}}<</SYS>>\n\n",  // system
    ["[INST]", "[/INST]"], // roles
    false, // chat
    SeparatorStyle.LLAMA2, // sepStyle
    " ", // sep
    " </s><s>", // sep2
    undefined,  // stopStr
    [2],  // stopTokenIds
))
