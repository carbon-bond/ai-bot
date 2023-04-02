import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import morgan from 'morgan';
import config from 'config';
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const port: number = config.get('port');
const secret: string = config.get('secret');
const api_key: string = config.get('api_key');
logger.info(`port = ${port}, secret = ${secret}, api_key = ${api_key}`);

const app = express();
app.use(morgan('short'));
app.use(bodyParser.text({type: ['json', 'text']}));


// 中間件：檢查 HMAC
function verifyHMAC(req: Request, res: Response, next: NextFunction) {
  const hmac = req.headers['hmac']; // 從 header 取得 HMAC
  if (!hmac) {
    return res.status(401).send('HMAC is missing');
  }

  const payload = req.body;
  console.log(payload);
  const computedHMAC = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  if (hmac !== computedHMAC) {
    return res.status(401).send('HMAC is invalid');
  }

  next();
}

// 路由：需要 HMAC 校驗
app.post('/', verifyHMAC, (req, res) => {
  res.send('HMAC is valid');
});

// 啟動伺服器
app.listen(1234, () => {
  console.log('Server started on port 3000');
});
