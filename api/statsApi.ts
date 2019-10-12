import * as fetch from 'node-fetch';
import * as util from '../util';
import * as config from '../config/config';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

export class StatsApi {

    async getNumberOfTipsLastHour(from:Date, to:Date) : Promise<number> {
        let feed = await this.callCountApi("?type=tip&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        console.log(feed);
        return feed.count;
    }

    async getNumberOfXRPSentLastHour(from:Date, to:Date) : Promise<number> {
        let feed = await this.callAggregateApi("/xrp?type=tip&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        console.log(feed);
        return feed.xrp;
    }

    async callAggregateApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_AGGREGATE_API+queryParams);
    }

    async callCountApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_COUNT_API+queryParams);
    }

    async callFeedApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_FEED_API+queryParams);
    }

    async callStatsApi(url: string) : Promise<any> {
        console.log("calling: " + url);
        try {
            let apiResponse = await fetch.default(url, { headers: {"Content-Type": "application/json"}, method: 'GET'});
            if(apiResponse && apiResponse.ok) {
                return apiResponse.json();
            } else {
                //something went wrong. Just tweet about it
                return false;
            }
        } catch(err) {
            console.log(JSON.stringify(err));
            return false;
        }
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STATS] ', message);
    }
}