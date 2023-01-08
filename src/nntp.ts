import { Websocket, WebsocketBuilder } from "websocket-ts";
import type { GroupInfo } from "./nntp/group_info";
import type {
  CommandRequest,
  CommandResponse,
  NNTPCommand,
} from "./nntp/nntp_command";
import { Completer } from "./utils/completer";
import { Queue } from "./utils/queue";

export class NNTPClient {
  private commandQueue = new Queue<NNTPCommand>();
  private tempBuffer: Array<string> = [];
  private ws: Websocket;

  constructor(url: string) {
    this.ws = new WebsocketBuilder(url)
      .onMessage((ins, evt) => {
        if ((evt.data as string).startsWith("201")) {
          console.debug("skipping welcome message");
        }
        let data = evt.data as string;

        let responseLines = data.split("\r\n");

        if (
          (responseLines.length > 1 || this.tempBuffer.length != 0) &&
          responseLines[responseLines.length - 1] != "."
        ) {
          // if it's multiline response and it doesn't contain dot in the end
          // then looks like we need to wait for next message to concatenate with current msg
          this.tempBuffer.push(data);
        }

        if (this.tempBuffer.length != 0) {
          this.tempBuffer.push(data);
          data = this.tempBuffer.join();
          responseLines = data.split("\r\n");
          responseLines.pop();
          this.tempBuffer = [];
        }

        const command = this.commandQueue.dequeue();
        const respCode = parseInt(responseLines[0].split(" ")[0]);
        command?.response.complete({
          responseCode: respCode,
          lines: responseLines,
        } as CommandResponse);
      })
      .build();
  }

  private async sendCommand(
    command: string,
    args: string[]
  ): Promise<CommandResponse> {
    const cmd = {
      request: { command: command, args: args } as CommandRequest,
      response: new Completer<CommandResponse>(),
    } as NNTPCommand;

    this.commandQueue.enqueue(cmd);
    if (args.length > 0) {
      this.ws.send(`${command} ${args.join(" ")}\r\n`);
    } else {
      this.ws.send(`${command}`);
    }

    const result = await cmd.response.promise;
    return result;
  }

  private async getNewsGroupList(): Promise<GroupInfo[]> {
    const l: GroupInfo[] = [];
    const groupMap: Record<string, Partial<GroupInfo>> = {};

    await this.sendCommand("LIST", ["NEWSGROUPS"]).then((value) => {
      value.lines.shift();
      value.lines.pop();
      value.lines.forEach((elem) => {
        const firstSpace = elem.indexOf(" ");
        const name = elem.substring(0, firstSpace);
        groupMap[name] = { description: elem.substring(firstSpace + 1) };
      });
    });

    await this.sendCommand("LIST", ["ACTIVE"]).then((value) => {
      value.lines.shift();
      value.lines.pop();
      value.lines.forEach((elem) => {
        const splitted = elem.split(" ");
        const [name, high, low] = splitted;
        groupMap[name].highWater = Number(high);
        groupMap[name].lowWater = Number(low);
      });
    });

    Object.keys(groupMap).forEach((key) => {
      l.push({
        name: groupMap[key].name!,
        description: groupMap[key].description!,
        lowWater: groupMap[key].lowWater!,
        highWater: groupMap[key].highWater!,
      });
    });

    return l;
  }
}
