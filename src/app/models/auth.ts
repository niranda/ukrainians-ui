export interface Auth {
    name: string,
    email?: string,
    password: string,
    role: string,
    clientURI: string;
}