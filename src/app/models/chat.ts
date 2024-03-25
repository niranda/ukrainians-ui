import { User } from "./user";

export interface Chat {
    chatMessage: string;
    privateChatId: string;
    user: User;
    unread: number;
    hovered?: boolean;
}