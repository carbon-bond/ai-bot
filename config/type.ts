export type Config = {
    // webhook listen 的 port
    port: number,

    secret: string,
    api_key: string,
    api_endpoint: string

    user_name: string,
    password: string,
};