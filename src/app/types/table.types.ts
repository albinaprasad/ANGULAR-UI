export type Column = {
    name: string;
    type: string;
}

export type Action<H,T> = {
    header: string;
    name: string;
    callback: (arg:H) => T;
    disabled?: (arg:H) => boolean;
    disabledHint?: string | ((arg:H) => string);
}

export type ActionEmit<H,T> = {
    action: Action<H,T>;
    row: any;
}

export type Data = string | number | boolean
