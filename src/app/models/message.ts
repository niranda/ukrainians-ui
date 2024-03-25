export interface Message {
    from: string;
    to?: string;
    content: string;
    chatRoomId?: string;
    created: Date;
    id?: string;
    unread: boolean;
    hovered?: boolean;
}