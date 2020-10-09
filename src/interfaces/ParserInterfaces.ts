export interface ParserOptions {
    encoding: string;
    objectMode: boolean;
}

export interface ParserResult {
    prefix: string;
    command: string;
    params: string;
    //trailing: string;
    //line: string;
}
