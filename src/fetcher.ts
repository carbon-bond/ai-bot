/// <reference lib="dom" />
import { api_trait } from './api/';
import config from 'config';
import { logger } from './logger';

const api_endpoint: string = config.get('api_endpoint');
const user_name: string = config.get('user_name');
const password: string = config.get('password');

let stored_cookie = '';

async function fetchResult(query: object, first_time = true): Promise<string> {
	const response = await fetch(api_endpoint, {
		body: JSON.stringify(query),
		method: 'POST',
        headers: {
            cookie: stored_cookie,
            credentials: 'include'
        }
	});

	const text = await response.text();
    const data = JSON.parse(text);

    if (first_time &&
        'Err' in data &&
        'LogicError' in data['Err'] &&
        data['Err']['LogicError'].code == 'NeedLogin') {
        logger.info('fetcher 重新登入');
        const response = await fetch(api_endpoint, {
            body: JSON.stringify({ "User": { "Login": { user_name, password } } }),
            method: 'POST'
        });

        const cookie = response.headers.get('set-cookie');
        if (cookie == null || cookie.length == 0) {
            throw new Error(`登入失敗！${JSON.stringify(response.body)}`);
        } else {
            stored_cookie = cookie;
        }
        return fetchResult(query, false);

    } else {
        return text;
    }

}

export const API_FETCHER = new api_trait.RootQuery(fetchResult);
