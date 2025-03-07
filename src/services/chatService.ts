import { AxiosResponse } from "axios";
import api from "./api"

const sendMessage = async (messages: any) : Promise<AxiosResponse<ChatResponse>> => {
    return api.post("/chat/send", {messages});
}

type ChatResponse = {
    role: String,
    content: [{type: String, text: String}]
}

export default {
    sendMessage
}