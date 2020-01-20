
import { StringMap, bodyAsString } from "./utils";
import { RestRequest } from "./RestRequest";
import { AxiosResponse } from "axios";
import { HeaderMap } from "./HeaderMap";

export interface EntityRequest {
    body: string | Buffer | null;
    headers: HeaderMap;
}

export interface EntityResponse {
    body: any;
    headers: HeaderMap;
    statusText: string;
    status: number;
}

export type EntityMap = Record<string, Entity>;

export class Entity {
    
    request: EntityRequest;
    response: EntityResponse;
    
    constructor(req: RestRequest, res: AxiosResponse) {
        this.request = {
            body: req.body,
            headers: req.headers,
        };
        this.response = {
            body: res.data,
            headers: HeaderMap.from(res.headers),
            statusText: res.statusText,
            status: res.status,
        };
    }
}
