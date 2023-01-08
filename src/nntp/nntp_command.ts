import type { Completer } from "@/utils/completer";

export interface NNTPCommand {
    request: CommandRequest;
    response: Completer<CommandResponse>;
}

export interface CommandRequest {
    command: string;
    args: Array<string>;
}

export interface CommandResponse {
    responseCode: number;
    lines: Array<string>;
}