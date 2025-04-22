import { AxiosResponse } from "axios";
import api from "./api"

const sendMessage = async (messages: any) : Promise<AxiosResponse<ChatResponse>> => {
    return api.post("/chat/send", {messages});
}

const search = async (input: string) : Promise<AxiosResponse<SearchResponse>> => {
    return api.post("/chat/search", {searchText:input});
}

type ChatResponse = {
    role: String,
    content: [{type: String, text: String}]
}

type SearchResponse = {
    success: boolean,
    data: string[]
}

export default {
    sendMessage,
    search
}