import { AxiosResponse } from "axios";
import api from "./api"

const login = async (data: LoginRequest) : Promise<AxiosResponse<LoginResponse>> => {
    return api.post("/auth/login", data);
}

const register = async (data: RegisterRequest) : Promise<AxiosResponse<RegisterResponse>> => {
    return api.post("/auth/register", data);
}

const verifyToken = async () => {
    return api.get("/auth/verify-token");
}


type LoginRequest = {
    email: string;
    password: string;
}
type LoginResponse = {
    token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        createdAt: string;
        provider: string;
        __v: number;
    }
}
type RegisterRequest = {
    email: string;
    password: string;
    name: string;
}
type RegisterResponse = {
    token: string;
    user: {
        _id: string;
        email: string;
        name: string;
        createdAt: string;
        provider: string;
        __v: number;
    }
}


export default {
    login,
    register,
    verifyToken
}

