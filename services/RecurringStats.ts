import * as Stats from '../api/statsApi';
import * as Twitter from '../api/twitterApi';
import * as config from '../config/config';
import * as util from '../util';

let statsApi:Stats.StatsApi = new Stats.StatsApi();

export class RecurringStatsService {

    constructor(private twitterAPI: Twitter.TwitterApi) {}

    async collect6hStats() {
        let to_date = util.setZeroMinutes(new Date());
        let from_date = util.setZeroMinutes(new Date());
        from_date.setHours(from_date.getHours()-6);
    
        await this.generateOverallTweet("6h",from_date, to_date);
    
        await this.generateTopUserTweet("6h",from_date, to_date);
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
        let highestDeposit = await statsApi.getHighestDeposit(from_date, to_date);
        let highestWithdraw = await statsApi.getHighestWithdraw(from_date, to_date);
    
        let overallTweet = "Overall @xrptipbot stats for the last "+timeframe+":\n\n";
        overallTweet+= "# of tips: " + numberOfTips + "\n";
        overallTweet+= amountOfXRPsent+" #XRP has been sent.\n";
        overallTweet+= "ILP deposits: " + ilpDepositsXRP + " $XRP.\n"
        overallTweet+= (highestDeposit ? "Highest deposit: " + highestDeposit.xrp + " $XRP.\n":"");
        overallTweet+= (highestWithdraw ? "Highest withdraw: " + highestWithdraw.xrp + " $XRP.":"");
        overallTweet+= util.getLinkTextOverall(from_date,to_date);
    
        console.log(overallTweet)
        this.twitterAPI.sendTweet(overallTweet);
    }
    
    async generateTopUserTweet(timeframe:string, from_date:Date, to_date:Date): Promise<any> {
        let topStatsTweet:string = ".@xrptipbot user stats for the last "+timeframe+":\n\n";
    
        switch(util.getRandomInt(4)) {
            case 0: {
                let mostReceivedTips = await statsApi.getMostReceivedTips(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostReceivedTips[0]) + " received the most tips in the last "+timeframe+": " + mostReceivedTips[0].count +" tips.";
                topStatsTweet+= util.getLinkTextUser(mostReceivedTips[0],from_date, to_date);
                break;
            }
            case 1: {
                let mostReceivedXRP = await statsApi.getMostReceivedXRP(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostReceivedXRP[0]) + " received the most #XRP in the last "+timeframe+": " + (mostReceivedXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                topStatsTweet+= util.getLinkTextUser(mostReceivedXRP[0],from_date, to_date);
                break;
            }
            case 2: {
                let mostSentTips = await statsApi.getMostSentTips(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostSentTips[0]) + " sent the most tips in the last "+timeframe+": " + mostSentTips[0].count +" tips.";
                topStatsTweet+= util.getLinkTextUser(mostSentTips[0],from_date, to_date);
                break;
            }
            case 3: {
                let mostSentXRP = await statsApi.getMostSentXRP(from_date, to_date);
                topStatsTweet+= util.getUserNameNetwork(mostSentXRP[0]) + " sent the most #XRP in the last "+timeframe+": " + (mostSentXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                topStatsTweet+= util.getLinkTextUser(mostSentXRP[0],from_date, to_date);
                break;
            }
        }
    
        console.log(topStatsTweet)
        this.twitterAPI.sendTweet(topStatsTweet);
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STAT_UPDATES] ', message);
    }
}