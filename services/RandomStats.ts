import * as Stats from '../api/statsApi';
import * as Twitter from '../api/twitterApi';
import * as config from '../config/config';
import * as util from '../util';

let statsApi:Stats.StatsApi = new Stats.StatsApi();

export class RandomStatsService {

    lastRandomNumberTime:number;
    lastRandomNumber:number;

    constructor(private twitterAPI: Twitter.TwitterApi) {}
    
    async collectRandomStats() {
        let randomNumber:number;
        let timeframe:string;
        let to_date:Date;
        let from_date:Date;

        //always choose another randon number (not previous one!)
        do {
            randomNumber = util.getRandomInt(8)
        } while(this.lastRandomNumber == randomNumber)

        switch(randomNumber) {
            case 0: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setHours(from_date.getHours()-1);
                timeframe = "1h";
                break;
            }
            case 1: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setHours(from_date.getHours()-4);
                timeframe = "4h";
                break;
            }
            case 2: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setHours(from_date.getHours()-12);
                timeframe = "12h";
                break;
            }
            case 3: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setHours(from_date.getHours()-24);
                timeframe = "24h";
                break;
            }
            case 4: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setDate(from_date.getDate()-7);
                timeframe = "week";
                break;
            }
            case 5: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setMonth(from_date.getMonth()-1);
                timeframe = "month";
                break;
            }
            case 6: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setMonth(from_date.getMonth()-6);
                timeframe = "6 months";
                break;
            }
            case 7: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setFullYear(from_date.getFullYear()-1);
                timeframe = "year";
                break;
            }
            default: {
                to_date = util.setZeroMinutes(new Date());
                from_date = util.setZeroMinutes(new Date());
                from_date.setHours(from_date.getHours()-4);
                timeframe = "4h";
                break;
            }
        }
    
        await this.generateRandomStatsTweet(timeframe,from_date, to_date);
    }

    async generateRandomStatsTweet(timeframe:string, from_date:Date, to_date:Date): Promise<any> {
        let topStatsTweet:string = ".@xrptipbot special stats:\n\n";

        let statsText:string;

        let randomNumber;

        //always choose another randon number (not previous one!)
        do {
            randomNumber = util.getRandomInt(13)
        } while(this.lastRandomNumber == randomNumber)
        
        
        this.lastRandomNumber = randomNumber;
    
        switch(randomNumber) {
            //average xrp amount per tweet
            case 0: {
                let numberOfTips = await statsApi.callCountApi("?type=tip&network=twitter", from_date, to_date);
                let amountSent = await statsApi.callAggregateApi("?type=tip&network=twitter", from_date, to_date);
                let average = Math.round(amountSent/numberOfTips*config.XRP_DROPS)/config.XRP_DROPS;

                if(!isNaN(average))
                    statsText = "An average of " + average + " $XRP has been sent per tip on @Twitter in the last " + timeframe + ".";
                else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);

                break;
            }
            //average xrp amount per app
            case 1: {
                let numberOfTips = await statsApi.callCountApi("?type=tip&network=app", from_date, to_date);
                let amountSent = await statsApi.callAggregateApi("?type=tip&network=app", from_date, to_date);
                let average = Math.round(amountSent/numberOfTips*config.XRP_DROPS)/config.XRP_DROPS;

                if(!isNaN(average))
                    statsText = "An average of " + average + " $XRP has been sent via @xrptipbot App in the last " + timeframe+ ".";
                else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);

                break;
            }
            //percentage of tips
            case 2: {
                let allTips = await statsApi.callCountApi("?type=tip", from_date, to_date); 
                let appTips = await statsApi.callCountApi("?type=tip&network=app", from_date, to_date);
                let twitterTips = await statsApi.callCountApi("?type=tip&network=twitter", from_date, to_date);
                let redditTips = await statsApi.callCountApi("?type=tip&network=reddit", from_date, to_date);
                let discordTips = await statsApi.callCountApi("?type=tip&network=discord", from_date, to_date);
                let buttonTips = await statsApi.callCountApi("?type=tip&network=btn", from_date, to_date);

                statsText = "In the last " + timeframe + " " + (appTips*100/allTips).toFixed(2) + "% of all tips were sent via @xrptipbot App!";
                statsText+= twitterTips > 0 ? "\nTips via Twitter: " + (twitterTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= redditTips > 0 ? "\nTips via Reddit: " + (redditTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= discordTips > 0 ? "\nTips via Discord: " + (discordTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= buttonTips > 0 ? "\nTips via @xrptipbot Button: " + (buttonTips*100/allTips).toFixed(2) + "%" : "";

                break;
            }
            //Highest Withdrawal
            case 3:{
                let highestWithdrawal = await statsApi.getHighestWithdraw(from_date,to_date);
                if(highestWithdrawal)
                    statsText= "The highest Withdrawal in the last " + timeframe + " was: " + highestWithdrawal.xrp + " $XRP";
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Highest Deposit
            case 4:{
                let highestDeposit = await statsApi.getHighestDeposit(from_date,to_date);
                if(highestDeposit)
                    statsText = "The highest deposit in the last " + timeframe + " was: " + highestDeposit.xrp + " $XRP";
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Number of Deposits
            case 5: {
                let numberOfDeposits = await statsApi.callCountApi("?type=deposit", from_date, to_date);
                if(numberOfDeposits > 0)
                    statsText = numberOfDeposits + " deposits happened in the last " + timeframe + "."
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Number of Withdraw
            case 6: {
                let numberOfWithdrawals = await statsApi.callCountApi("?type=withdraw", from_date, to_date);
                if(numberOfWithdrawals > 0)
                    statsText = numberOfWithdrawals + " withdrawals happened in the last " + timeframe + "."
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Amount of Deposits
            case 7: {
                let amountOfDeposits = await statsApi.callAggregateApi("?type=deposit", from_date, to_date);
                if(amountOfDeposits > 0)
                    statsText = "In the last " + timeframe + " an overall of " + amountOfDeposits + " #XRP were deposited into @xrptipbot accounts.";
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Amount of Withdraw
            case 8: {
                let amountOfWithdrawals = await statsApi.callAggregateApi("?type=withdraw", from_date, to_date);
                if(amountOfWithdrawals > 0)
                    statsText = "In the last " + timeframe + " an overall of " + amountOfWithdrawals + " #XRP were withdrawn from @xrptipbot accounts.";
                else
                    await this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Most tips received
            case 9: {
                let mostReceivedTips = await statsApi.getMostReceivedTips(from_date, to_date);
                if(mostReceivedTips && mostReceivedTips[0]) {
                    statsText = util.getUserNameNetwork(mostReceivedTips[0]) + " received the most tips in the last "+timeframe+": " + mostReceivedTips[0].count +" tips.";
                    statsText+= util.getLinkTextUser(mostReceivedTips[0],from_date, to_date);
                } else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Most XRP received
            case 10: {
                let mostReceivedXRP = await statsApi.getMostReceivedXRP(from_date, to_date);
                if(mostReceivedXRP && mostReceivedXRP[0]) {
                    statsText = util.getUserNameNetwork(mostReceivedXRP[0]) + " received the most #XRP in the last "+timeframe+": " + (mostReceivedXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                    statsText+= util.getLinkTextUser(mostReceivedXRP[0],from_date, to_date);
                } else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Most tips sent
            case 11: {
                let mostSentTips = await statsApi.callCountApiMostReceived("?type=tip&limit=1", from_date, to_date);
                if(mostSentTips && mostSentTips[0]) {
                    statsText = util.getUserNameNetwork(mostSentTips[0]) + " sent the most tips in the last "+timeframe+": " + mostSentTips[0].count +" tips.";
                    statsText+= util.getLinkTextUser(mostSentTips[0],from_date, to_date);
                } else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            //Most XRP sent
            case 12: {
                let mostSentXRP = await statsApi.getMostSentXRP(from_date, to_date);
                if(mostSentXRP) {
                    statsText= util.getUserNameNetwork(mostSentXRP[0]) + " sent the most #XRP in the last "+timeframe+": " + (mostSentXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                    statsText+= util.getLinkTextUser(mostSentXRP[0],from_date, to_date);
                } else
                    this.generateRandomStatsTweet(timeframe, from_date, to_date);
                break;
            }
            default: {
                let allTips = await statsApi.callCountApi("?type=tip", from_date, to_date); 
                let appTips = await statsApi.callCountApi("?type=tip&network=app", from_date, to_date);
                let twitterTips = await statsApi.callCountApi("?type=tip&network=twitter", from_date, to_date);
                let redditTips = await statsApi.callCountApi("?type=tip&network=reddit", from_date, to_date);
                let discordTips = await statsApi.callCountApi("?type=tip&network=discord", from_date, to_date);
                let buttonTips = await statsApi.callCountApi("?type=tip&network=btn", from_date, to_date);

                statsText = "In the last " + timeframe + " " + (appTips*100/allTips).toFixed(2) + "% of all tips were sent via @xrptipbot App!";
                statsText+= twitterTips > 0 ? "\nTips via Twitter: " + (twitterTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= redditTips > 0 ? "\nTips via Reddit: " + (redditTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= discordTips > 0 ? "\nTips via Discord: " + (discordTips*100/allTips).toFixed(2) + "%" : "";
                statsText+= buttonTips > 0 ? "\nTips via @xrptipbot Button: " + (buttonTips*100/allTips).toFixed(2) + "%" : "";

                break;
            }
        }
    
        if(statsText) {
            topStatsTweet+= statsText;
            topStatsTweet+= "\n\n#XRPCommunity #XRPTipBot #Stats"
            
            await this.twitterAPI.sendTweet(topStatsTweet);
        }
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STAT_UPDATES] ', message);
    }
}