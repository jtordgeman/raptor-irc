import { Transform } from "stream";
import { ParserResult } from "../interfaces/ParserInterfaces";

export class Parser extends Transform {
    constructor() {
        super({
            encoding: "utf8",
            objectMode: true,
        });
    }
    handle(line: string): ParserResult {
        const trimmed: string = line.trim();
        const messageArray = trimmed.split(" ");
        let prefix, command, params;

        // check for prefix
        if (messageArray[0].startsWith(":")) {
            prefix = messageArray.splice(0, 1)[0].trim();
        }

        command = messageArray.splice(0, 1)[0].trim();
        params = messageArray.join(" ").trim();

        return {
            prefix: prefix || "",
            command,
            params,
        };
    }
    _transform(chunk: any, _: string, callback: Function) {
        try {
            chunk
                .toString()
                .split("\r\n")
                .some((line: string) => {
                    line && this.push(JSON.stringify(this.handle(line)));
                });
        } finally {
            callback();
        }
    }
}
