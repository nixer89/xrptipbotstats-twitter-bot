import * as fetch from 'node-fetch';
import * as util from '../util';
import * as config from '../config/config';
import * as HttpsProxyAgent from 'https-proxy-agent';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

export class StatsApi {

    proxy = new HttpsProxyAgent("http://proxy:81");
    useProxy = false;

    // ############################################## API Methods to use ##############################################
    async getNumberOfTips(from?:Date, to?:Date): Promise<number> {
        return this.callCountApi("?type=tip",from, to);
    }

    async getNumberOfXRPSent(from?:Date, to?:Date): Promise<number> {
        return this.callAggregateApi("?type=tip",from, to);
        
    }

    async getNumberOfXRPDeposited(from?:Date, to?:Date): Promise<number> {
        return this.callAggregateApi("?type=deposit",from, to);
    }

    async getNumberOfXRPWithdrawn(from?:Date, to?:Date): Promise<number> {
        return this.callAggregateApi("?type=withdraw",from, to);
    }

    async getXRPDepositsILP(from?:Date, to?:Date): Promise<number> {
        return this.callAggregateILPApi("?type=ILP deposit",from, to);
    }

    async getHighestDeposit(from?:Date, to?:Date): Promise<any> {
        let deposits:any[] = await this.callStdFeedApi("?type=deposit",from, to);
        
        deposits = deposits.sort((a,b) => b.xrp - a.xrp);
        return deposits[0];
    }

    async getHighestWithdraw(from?:Date, to?:Date): Promise<any> {
        let withdraws:any[] = await this.callStdFeedApi("?type=withdraw",from, to);

        withdraws = withdraws.sort((a,b) => b.xrp - a.xrp);
        //console.log(withdraws);
        return withdraws[0];
    }

    async getMostReceivedXRP(from?:Date, to?:Date): Promise<any[]> {
        return this.callAggregateApiMostSent("?type=tip&limit=5",from, to);
    }

    async getMostSentXRP(from?:Date, to?:Date): Promise<any[]> {
        return this.callAggregateApiMostReceived("?type=tip&limit=5",from, to);
    }

    async getMostReceivedTips(from?:Date, to?:Date): Promise<any[]> {
        return this.callCountApiMostSent("?type=tip&limit=5",from, to);
    }

    async getMostSentTips(from?:Date, to?:Date): Promise<any[]> {
        return this.callCountApiMostReceived("?type=tip&limit=5",from, to);
    }

    // ############################################## END Helper Methods ##############################################

    // ######## STD Feed API ########

    async callStdFeedApi(queryParams:string, from_date?:Date, to_date?:Date ): Promise<any[]> {
        let apiResponse:any = await this.callApi(config.TIPBOT_FEED_API+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.feed;
    }

    // ######## Count API ########

    async callCountApi(queryParams:string, from_date?:Date, to_date?:Date): Promise<number> {
        let apiResponse:any = await this.callApi(config.TIPBOT_COUNT_API+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.count;
    }

    async callCountApiMostReceived(queryParams:string, from_date?:Date, to_date?:Date): Promise<any[]> {
        let apiResponse:any = await this.callApi(config.TIPBOT_COUNT_API+"/mostReceivedFrom"+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.result;
    }

    async callCountApiMostSent(queryParams:string, from_date?:Date, to_date?:Date): Promise<any[]> {
        let apiResponse:any = await this.callApi(config.TIPBOT_COUNT_API+"/mostSentTo"+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.result;
    }

    // ######## Aggregate API ########

    async callAggregateApi(queryParams:string, from_date?:Date, to_date?:Date): Promise<number> {
        let apiResponse:any = await this.callApi(config.TIPBOT_AGGREGATE_API+queryParams+this.getFromToQueryString(from_date,to_date));
        return (apiResponse.xrp*config.XRP_DROPS)/config.XRP_DROPS;
    }

    async callAggregateApiMostReceived(queryParams:string, from_date?:Date, to_date?:Date): Promise<any[]> {
        let apiResponse:any = await this.callApi(config.TIPBOT_AGGREGATE_API+"/mostReceivedFrom"+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.result;
    }

    async callAggregateApiMostSent(queryParams:string, from_date?:Date, to_date?:Date): Promise<any[]> {
        let apiResponse:any = await this.callApi(config.TIPBOT_AGGREGATE_API+"/mostSentTo"+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.result;
    }

    // ######## ILP API ########

    async callILPApi(queryParams:string, from_date?:Date, to_date?:Date): Promise<any[]> {
        let apiResponse:any = this.callApi(config.TIPBOT_ILP_API+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.feed;
    }

    async callAggregateILPApi(queryParams:string, from_date?:Date, to_date?:Date): Promise<number> {
        //console.log(config.TIPBOT_AGGREGATE_ILP_API+queryParams);
        let apiResponse:any = await this.callApi(config.TIPBOT_AGGREGATE_ILP_API+queryParams+this.getFromToQueryString(from_date,to_date));
        return apiResponse.amount/config.XRP_DROPS;
    }

    // ######## DISTINCT API ########

    async callDistinctApi(distinctField: string, queryParams: string, from_date?:Date, to_date?: Date) : Promise<number> {
        //console.log(config.TIPBOT_DISTINCT_API+queryParams+"&distinct="+distinctField+"&from_date="+util.dateToStringEuropeForAPI(from_date)+"&to_date="+util.dateToStringEuropeForAPI(to_date));
        let apiResponse:any = await this.callApi(config.TIPBOT_DISTINCT_API+queryParams+"&distinct="+distinctField+this.getFromToQueryString(from_date,to_date));
        return apiResponse.distinctCount;
    }

    // ######## Standard Fetch Method ########

    async callApi(url: string) : Promise<any> {
        //console.log("calling: " + url);
        try {
            let apiResponse = await fetch.default(url, { headers: {"Content-Type": "application/json"}, agent: this.useProxy ? this.proxy : null, method: 'GET'});
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

    getFromToQueryString(from_date:Date, to_date:Date): string {
        if(from_date && to_date)
            return "&from_date="+util.dateToStringEuropeForAPI(from_date)+"&to_date="+util.dateToStringEuropeForAPI(to_date);
        else 
            return "";
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STATS] ', message);
    }
}