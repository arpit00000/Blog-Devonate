export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    body: {
        username: string;
        email: string;
        password: string;
    };
}