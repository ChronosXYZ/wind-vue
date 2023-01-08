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
      .onMessage((_, evt) => {
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
    args: string[],
    prepareResponse = false // remove unnecessary things in lines array
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
    if (prepareResponse) {
      result.lines.shift();
      result.lines.pop();
    }
    return result;
  }

  private completeGroupInfo(obj: Partial<GroupInfo>): GroupInfo {
    return Object.assign(
      {
        name: "",
        description: "",
        lowWater: -1,
        highWater: -1,
      },
      obj
    );
  }

  public async getNewsGroupList(): Promise<GroupInfo[]> {
    const groupMap: Record<string, Partial<GroupInfo>> = {};
    const [newsgroupsResponse, activeResponse]: CommandResponse[] =
      await Promise.all([
        this.sendCommand("LIST", ["NEWSGROUPS"], true),
        this.sendCommand("LIST", ["ACTIVE"], true),
      ]);

    newsgroupsResponse.lines.forEach((val: string) => {
      const firstSpace = val.indexOf(" ");
      const name = val.substring(0, firstSpace);
      groupMap[name] = { description: val.substring(firstSpace + 1) };
    });

    activeResponse.lines.forEach((val: string) => {
      const splitted = val.split(" ");
      const [name, high, low]: string[] = splitted;
      groupMap[name].highWater = Number(high);
      groupMap[name].lowWater = Number(low);
    });

    const result = Object.entries(groupMap).map(([, obj]) =>
      this.completeGroupInfo(obj)
    );

    return result;
  }
}
