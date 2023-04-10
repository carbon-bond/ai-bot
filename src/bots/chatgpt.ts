import { API_FETCHER } from '../fetcher';
import config from 'config';
import { logger } from '../logger';

function toSlate(text: string): string {
    return JSON.stringify([{
        kind: 'Paragraph',
        children: [
            { text }
        ]
    }]);
}

const api_key: string = config.get('api_key');

const importDynamic = new Function('modulePath', 'return import(modulePath)',);

export async function chatgptReply(
    article_id: number,
    comment_content: string
) {
    const { ChatGPTAPI } = await importDynamic('chatgpt');
    const api = new ChatGPTAPI({
        apiKey: api_key
    });
    let response;
    try {
        response = await api.sendMessage(comment_content);
        logger.info(`chatgpt 回覆 ${response.text}`);
        API_FETCHER.articleQuery.createComment(article_id, toSlate(response.text), false)
            .then(data => console.log(JSON.stringify(data, null, 2)))
            .catch(err => console.error(err));
    } catch (err) {
        logger.error('chatgpt 錯誤');
        logger.error(err);
    }
}