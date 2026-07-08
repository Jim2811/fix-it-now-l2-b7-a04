export interface IUpdateTechnicianPayload {
    name?: string;
    phone?: string;
    address?: string;
    profileImg?: string;
    skills?: string[];
    bio?: string | null;
    experience?: number | string;
    hourlyRate?: number | string;
    services?: {
        name: string;
        description: string;
        price: number | string;
        categoryId: string;
    }[];
}