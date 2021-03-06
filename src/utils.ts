
import path from 'path';
import fs from 'fs-extra';
import realGlob from 'glob';
import fecha from 'fecha';
import xmlBeautify from 'xml-beautifier';
import { DurationObject, DateTime } from 'luxon';
import { Headers } from 'node-fetch';

export type StringMap = Record<string, string>;

export function bodyAsString(body: unknown): string {
    if (!body) return "";

    return Buffer.isBuffer(body)
        ? body.toString("utf-8")
        : typeof body === "string"
        ?  body
        : "";
}

type EntityLike = {
    headers: Headers;
    getBody: () => string;
}

export function bodyFormat(entity: EntityLike): string {
    const body = entity.getBody();
    const type = entity.headers.get("content-type");

    if (!body || !type) return body;

    if (type.startsWith("application/json")) {
        return jsonFormat(body);
    }
    else if (type.startsWith("text/xml") ||
            type.startsWith("application/xml")) {
        return xmlBeautify(body);
    }

    return body;
}

export function jsonFormat(content: string) {
    const json = safeParseJson(content);
    if (!json) return content;

    return JSON.stringify(json, undefined, 4);
}

export function safeParseJson(body: string): any {
    try {
        return JSON.parse(body);
    }
    catch (error) {
        console.warn("Not a JSON body.\n" + error.message);
        return null;
    }
}

type Args = {
    node: string;
    script: string;
    options: StringMap;
    args: string[];
}

export function getArgs(flags: string[] = [], argv = process.argv): Args {
    const [node, script, ...rest] = argv;

    const options: StringMap = {};
    const args: string[] = [];

    let name: undefined | string;

    for (let arg of rest) {
        const m = /^-+(.+)$/.exec(arg);

        if (m) {
            name = m[1];
            options[name] = "true";

            if (flags.includes(name)) {
                name = undefined;
            }
        }
        else if (name) {
            options[name] = arg;
            name = undefined;
        }
        else {
            args.push(arg);
        }
    }

    return { node, script, options, args };
}


export async function retry(attempts: number, cb: (attempt: number) => void | Promise<void>) {
    let attempt = 1;
    for (;;) {
        try {
            await cb(attempt);
            break;
        }
        catch (error) {
            if (attempt == attempts) {
                throw error;
            }
        }
        attempt++;
    }
}

export function capitalise(input: string) {
    return input.toLowerCase().replace(/\b\w/g, m => m.toUpperCase());
}

export function getDuration(offset: number, option: string): DurationObject | undefined {
    switch (option) {
        case 'ms':
            return { milliseconds: offset };
        case 's':
            return { seconds: offset };
        case 'm':
            return { minutes: offset };
        case 'h':
            return { hours: offset };
        case 'd':
            return { days: offset };
        case 'w':
            return { weeks: offset };
        case 'M':
            return { months: offset };
        case 'Q':
            return { quarters: offset };
        case 'y':
            return { years: offset };
    }
    return undefined;
}

export function getOffset(date: DateTime, offset?: string, option?: string) {
    if (offset && option) {
        const duration = getDuration(+offset, option);

        if (duration) {
            date = date.plus(duration);
        }
    }

    return date;
}

export function formatDate(date: DateTime, format: string) {
    switch (format) {
        case "rfc1123":
            return date.toHTTP();
        case "iso8601":
            return date.toISO();
    }

    format = format.replace(/^["']+|['"]+$/g, '');

    try {
        return fecha.format(date.toJSDate(), format);
    }
    catch (error) {
        return format;
    }
}

export function basicAuth(username: string, password: string) {
    const base64 = Buffer.from(username + ':' + password).toString('base64');
    return 'Basic ' + base64;
}

// @todo Should the extension regex be an argument?
export async function* expandPaths(...patterns: string[]): AsyncGenerator<string> {
    for (let pattern of patterns) {
        if (!pattern) continue;

        for (let pathname of await glob(pattern)) {
            const stats = await fs.lstat(pathname);

            if (stats.isFile()) {
                if (!pathname.match(/\.(http|rest)$/)) continue;
                yield path.resolve(pathname);
            }
            else if (stats.isDirectory()) {
                for (let subPath of await fs.readdir(pathname)) {
                    if (!subPath.match(/\.(http|rest)$/)) continue;

                    yield path.resolve(pathname, subPath);
                }
            }
        }
    }
}

export async function glob(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        realGlob(pattern, (error, matches) => {
            if (error) reject(error);
            else resolve(matches);
        })
    });
}
