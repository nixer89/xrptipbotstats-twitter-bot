import * as fetch from 'node-fetch';
import * as util from '../util';
import * as config from '../config/config';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

export class StatsApi {

    async getNumberOfTips(from:Date, to:Date): Promise<number> {
        let apiResponse = await this.callCountApi("?type=tip&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        //console.log(apiResponse);
        return apiResponse.count;
    }

    async getNumberOfXRPSent(from:Date, to:Date): Promise<number> {
        let apiResponse = await this.callAggregateApi("/xrp?type=tip&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        //console.log(apiResponse);
        return apiResponse.xrp;
    }

    async getHighestDeposit(from:Date, to:Date): Promise<any> {
        let apiResponse = await this.callFeedApi("?type=deposit&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        //console.log(apiResponse);

        let deposits:any[] = apiResponse.feed;
        deposits = deposits.sort((a,b) => b.xrp - a.xrp);
        //console.log(deposits);
        return deposits[0];
    }

    async getHighestWithdraw(from:Date, to:Date): Promise<any> {
        let apiResponse = await this.callFeedApi("?type=withdraw&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        //console.log(apiResponse);

        let withdraws:any[] = apiResponse.feed;
        withdraws = withdraws.sort((a,b) => b.xrp - a.xrp);
        //console.log(withdraws);
        return withdraws[0];
    }

    async getMostReceivedXRP(from:Date, to:Date): Promise<any[]> {
        let apiResponse = await this.callAggregateApi("/xrp/mostSentTo?type=tip&limit=5&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        return apiResponse.result;
    }

    async getMostSentXRP(from:Date, to:Date): Promise<any[]> {
        let apiResponse = await this.callAggregateApi("/xrp/mostReceivedFrom?type=tip&limit=5&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        return apiResponse.result;
    }

    async getMostReceivedTips(from:Date, to:Date): Promise<any[]> {
        let apiResponse = await this.callCountApi("/mostSentTo?type=tip&limit=5&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        return apiResponse.result;
    }

    async getMostSentTips(from:Date, to:Date): Promise<any[]> {
        let apiResponse = await this.callCountApi("/mostReceivedFrom?type=tip&limit=5&from_date="+from.toLocaleString()+"&to_date="+to.toLocaleString());
        return apiResponse.result;
    }

    async callAggregateApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_AGGREGATE_API+queryParams);
    }

    async callAggregateILPApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_AGGREGATE_ILP_API+queryParams);
    }

    async callCountApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_COUNT_API+queryParams);
    }

    async callFeedApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_FEED_API+queryParams);
    }

    async callILPApi(queryParams:string) {
        return this.callStatsApi(config.TIPBOT_ILP_API+queryParams);
    }

    async callStatsApi(url: string) : Promise<any> {
        //console.log("calling: " + url);
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