import * as Twit from 'twit';
import * as util from '../util';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

export class TwitterApi {

    consumer_key:string;
    consumer_secret:string;
    access_token:string;
    access_token_secret:string;

    twitterClient:Twit;

    constructor(consumer_key:string, consumer_secret:string, access_token:string, access_token_secret:string) {
        this.consumer_key = consumer_key;
        this.consumer_secret = consumer_secret;
        this.access_token = access_token;
        this.access_token_secret = access_token_secret;
    }

    async initTwitter() {
        this.twitterClient = new Twit({
            consumer_key: this.consumer_key,
            consumer_secret: this.consumer_secret,
            access_token: this.access_token,
            access_token_secret: this.access_token_secret
        });
    }

    async sendTweet(message:string) {
        try {
            await this.twitterClient.post('statuses/update', {status:message});
        } catch(err) {
            this.writeToConsole(JSON.stringify(err));
        }
    }

    writeToConsole(message:string) {
        util.writeConsoleLog('[TWITTER] ', message);
    }
}
