import { ChatCompletionRequestMessageRoleEnum } from "openai";

export interface Chat {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
}
