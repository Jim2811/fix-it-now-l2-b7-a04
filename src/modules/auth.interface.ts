export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role:  "CUSTOMER" | "TECHNICIAN";
    profileImg?: string;
    address?: string;
    phone?: string;
}