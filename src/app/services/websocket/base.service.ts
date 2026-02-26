import environmentJSON from "../../../../configs/environment.json";

export class BaseWebSocketService {
    protected BASE_URL = environmentJSON.WEB_SOCKET_URL
    protected AUTH_TOKEN_KEY = environmentJSON.AUTH_TOKEN_KEY
    protected socket?: WebSocket;


    protected getAuthToken(): string | null {
        return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }

    protected buildSocketUrl(route: string, token: string): string {
        const trimmedBase = this.BASE_URL.replace(/\/+$/, "");
        const trimmedRoute = route.replace(/^\/+|\/+$/g, "");
        const url = new URL(`${trimmedBase}/${trimmedRoute}/`);
        url.searchParams.set("token", token);
        return url.toString();
    }

}
