import * as Stats from '../api/statsApi';
import * as Twitter from '../api/twitterApi';
import * as config from '../config/config';
import * as util from '../util';

let statsApi:Stats.StatsApi = new Stats.StatsApi();

export class RecurringStatsService {

    constructor(private twitterAPI: Twitter.TwitterApi) {}

    async collectMonthlyStats() {
        let to_date = util.setZeroMinutes(new Date());
        let from_date = util.setZeroMinutes(new Date());
        from_date.setMonth(from_date.getMonth()-1);
    
        await this.generateOverallTweet("month",from_date, to_date);
    
        await this.generateTopUserTweet("month",from_date, to_date);
    }

    async collectWeeklyStats() {
        let to_date = util.setZeroMinutes(new Date());
        let from_date = util.setZeroMinutes(new Date());
        from_date.setDate(from_date.getDate()-7);
    
        await this.generateOverallTweet("week",from_date, to_date);
    
        await this.generateTopUserTweet("week",from_date, to_date);
    }
    
    async collectDailyStats() {
        let to_date = util.setZeroMinutes(new Date());
        let from_date = util.setZeroMinutes(new Date());
        from_date.setDate(from_date.getDate()-1);
    
        await this.generateOverallTweet("24h",from_date, to_date);
    
        await this.generateTopUserTweet("24h",from_date, to_date);
    }
    
    async generateOverallTweet(timeframe:string, from_date: Date, to_date: Date): Promise<any> {
        let numberOfTips = await statsApi.getNumberOfTips(from_date, to_date);
        let amountOfXRPsent = await statsApi.getNumberOfXRPSent(from_date, to_date);
        let ilpDepositsXRP = await statsApi.getXRPDepositsILP(from_date, to_date);
        let amountDeposited = await statsApi.getNumberOfXRPDeposited(from_date, to_date);
        let amountWithdrawn = await statsApi.getNumberOfXRPWithdrawn(from_date, to_date);
    
        let overallTweet = "Overall @xrptipbot stats for the last ⏱️ "+timeframe+":\n\n";
        overallTweet+= "# of tips: " + numberOfTips + "\n";
        overallTweet+= amountOfXRPsent+" #XRP has been sent.\n";
        overallTweet+= "Deposits: " + amountDeposited + " $XRP.\n";
        overallTweet+= "Withdrawals: " + amountWithdrawn + " $XRP.\n";
        overallTweet+= "ILP deposits: " + ilpDepositsXRP + " $XRP.";
        overallTweet+= util.getLinkTextOverall(from_date,to_date);
    
        this.twitterAPI.sendTweet(overallTweet);
    }
    
    async generateTopUserTweet(timeframe:string, from_date:Date, to_date:Date): Promise<any> {
        let topStatsTweet:string = ".@xrptipbot user stats for the last ⏱️ "+timeframe+":\n\n";
    
        switch(util.getRandomInt(12)) {
            case 0:
            case 7:
            case 8: {
                let mostReceivedTips = await statsApi.getMostReceivedTips(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostReceivedTips[0]) + " received the most tips in the last "+timeframe+": " + mostReceivedTips[0].count +" tips.";
                topStatsTweet+= util.getLinkTextUser(mostReceivedTips[0],from_date, to_date, true);
                break;
            }
            case 1:
            case 6:
            case 9: {
                let mostReceivedXRP = await statsApi.getMostReceivedXRP(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostReceivedXRP[0]) + " received the most #XRP via tip in the last "+timeframe+": " + (mostReceivedXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                topStatsTweet+= util.getLinkTextUser(mostReceivedXRP[0],from_date, to_date, true);
                break;
            }
            case 2:
            case 5:
            case 10: {
                let mostSentTips = await statsApi.callCountApiMostReceived("?type=tip&limit=1", from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostSentTips[0]) + " sent the most tips in the last "+timeframe+": " + mostSentTips[0].count +" tips.";
                topStatsTweet+= util.getLinkTextUser(mostSentTips[0],from_date, to_date, true);
                break;
            }
            case 3:
            case 4:
            case 11: {
                let mostSentXRP = await statsApi.getMostSentXRP(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostSentXRP[0]) + " sent the most #XRP via tip in the last "+timeframe+": " + (mostSentXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                topStatsTweet+= util.getLinkTextUser(mostSentXRP[0],from_date, to_date, true);
                break;
            }
        }
    
        this.twitterAPI.sendTweet(topStatsTweet);
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STAT_UPDATES] ', message);
    }
}