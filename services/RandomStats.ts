import * as Stats from '../api/statsApi';
import * as Twitter from '../api/twitterApi';
import * as config from '../config/config';
import * as util from '../util';

let statsApi:Stats.StatsApi = new Stats.StatsApi();

export class RandomStatsService {

    lastRandomNumberTime:number;
    lastRandomNumberStats:number;
    timeframe:string;

    constructor(private twitterAPI: Twitter.TwitterApi) {}
    
    async collectRandomStats(cases:number) {
        let randomNumber:number;
        let to_date:Date = util.setZeroMinutes(new Date());
        let from_date:Date = util.setZeroMinutes(new Date());

        //always choose another randon number (not previous one!)
        do {
            randomNumber = util.getRandomInt(cases)
        } while(this.lastRandomNumberTime == randomNumber)

        this.lastRandomNumberTime = randomNumber;

        from_date = this.getPreviousPeriod(randomNumber, from_date);
    
        await this.generateRandomStatsTweet(from_date, to_date);
    }

    async generateRandomStatsTweet(from_date:Date, to_date:Date): Promise<any> {
        let topStatsTweet:string = ".@xrptipbot special stats:\n\n";

        let statsText:string;

        let randomNumber;

        //always choose another randon number (not previous one!)
        do {
            randomNumber = util.getRandomInt(22)
        } while(this.lastRandomNumberStats == randomNumber)
        
        
        this.lastRandomNumberStats = randomNumber;
    
        switch(randomNumber) {
            //average xrp amount per tweet
            case 0: {
                let numberOfTips = await statsApi.callCountApi("?type=tip&network=twitter", from_date, to_date);
                let amountSent = await statsApi.callAggregateApi("?type=tip&network=twitter", from_date, to_date);
                let average = Math.round(amountSent/numberOfTips*config.XRP_DROPS)/config.XRP_DROPS;

                if(!isNaN(average))
                    statsText = "An average of " + average + " $XRP has been sent per tip on @Twitter in the last " + this.timeframe + ".";
                else
                    this.generateRandomStatsTweet( from_date, to_date);

                break;
            }
            //average xrp amount per app
            case 1: {
                let numberOfTips = await statsApi.callCountApi("?type=tip&network=app", from_date, to_date);
                let amountSent = await statsApi.callAggregateApi("?type=tip&network=app", from_date, to_date);
                let average = Math.round(amountSent/numberOfTips*config.XRP_DROPS)/config.XRP_DROPS;

                if(!isNaN(average))
                    statsText = "An average of " + average + " $XRP has been sent via @xrptipbot App in the last " + this.timeframe+ ".";
                else
                    this.generateRandomStatsTweet(from_date, to_date);

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

                statsText = "In the last " + this.timeframe + " " + (appTips*100/allTips).toFixed(2) + "% of all tips were sent via @xrptipbot App!";
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
                    statsText= "The highest Withdrawal in the last " + this.timeframe + " was: " + highestWithdrawal.xrp + " $XRP";
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Highest Deposit
            case 4:{
                let highestDeposit = await statsApi.getHighestDeposit(from_date,to_date);
                if(highestDeposit)
                    statsText = "The highest deposit in the last " + this.timeframe + " was: " + highestDeposit.xrp + " $XRP";
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Number of Deposits
            case 5: {
                let numberOfDeposits = await statsApi.callCountApi("?type=deposit", from_date, to_date);
                if(numberOfDeposits > 0)
                    statsText = numberOfDeposits + " deposits happened in the last " + this.timeframe + "."
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Number of Withdraw
            case 6: {
                let numberOfWithdrawals = await statsApi.callCountApi("?type=withdraw", from_date, to_date);
                if(numberOfWithdrawals > 0)
                    statsText = numberOfWithdrawals + " withdrawals happened in the last " + this.timeframe + "."
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Amount of Deposits
            case 7: {
                let amountOfDeposits = await statsApi.getNumberOfXRPDeposited(from_date, to_date);
                if(amountOfDeposits > 0)
                    statsText = "In the last " + this.timeframe + " an overall of " + amountOfDeposits + " #XRP were deposited into @xrptipbot accounts.";
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Amount of Withdraw
            case 8: {
                let amountOfWithdrawals = await statsApi.getNumberOfXRPWithdrawn(from_date, to_date);
                if(amountOfWithdrawals > 0)
                    statsText = "In the last " + this.timeframe + " an overall of " + amountOfWithdrawals + " #XRP were withdrawn from @xrptipbot accounts.";
                else
                    await this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Most tips received
            case 9: {
                let mostReceivedTips = await statsApi.getMostReceivedTips(from_date, to_date);
                if(mostReceivedTips && mostReceivedTips[0]) {
                    statsText = util.getUserNameNetwork(mostReceivedTips[0]) + " received the most tips in the last "+this.timeframe+": " + mostReceivedTips[0].count +" tips.";
                    statsText+= util.getLinkTextUser(mostReceivedTips[0],from_date, to_date, false);
                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Most XRP received
            case 10: {
                let mostReceivedXRP = await statsApi.getMostReceivedXRP(from_date, to_date);
                if(mostReceivedXRP && mostReceivedXRP[0]) {
                    statsText = util.getUserNameNetwork(mostReceivedXRP[0]) + " received the most #XRP in the last "+this.timeframe+": " + (mostReceivedXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                    statsText+= util.getLinkTextUser(mostReceivedXRP[0],from_date, to_date, false);
                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Most tips sent
            case 11: {
                let mostSentTips = await statsApi.callCountApiMostReceived("?type=tip&limit=1", from_date, to_date);
                if(mostSentTips && mostSentTips[0]) {
                    statsText = util.getUserNameNetwork(mostSentTips[0]) + " sent the most tips in the last "+this.timeframe+": " + mostSentTips[0].count +" tips.";
                    statsText+= util.getLinkTextUser(mostSentTips[0],from_date, to_date, false);
                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //Most XRP sent
            case 12: {
                let mostSentXRP = await statsApi.getMostSentXRP(from_date, to_date);
                if(mostSentXRP) {
                    statsText= util.getUserNameNetwork(mostSentXRP[0]) + " sent the most #XRP in the last "+this.timeframe+": " + (mostSentXRP[0].xrp*config.XRP_DROPS)/config.XRP_DROPS +" $XRP.";
                    statsText+= util.getLinkTextUser(mostSentXRP[0],from_date, to_date, false);
                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break;
            }
            //tip comparission previous period
            case 13: {
                if(this.lastRandomNumberTime < 7) { 
                    let tipsCountCurrentPeriod = await statsApi.getNumberOfTips(from_date,to_date);
                    let from_orig:Date = new Date(from_date);
                    let to_orig:Date = new Date(to_date);

                    from_date = this.getPreviousPeriod(this.lastRandomNumberTime, from_date);
                    to_date = this.getPreviousPeriod(this.lastRandomNumberTime, to_date);

                    let tipsCountPreviousPeriod = await statsApi.getNumberOfTips(from_date,to_date);

                    if(tipsCountPreviousPeriod > 0 && tipsCountCurrentPeriod > 0) {
                        let increaseOrDecrease = Math.round(((tipsCountCurrentPeriod*100/tipsCountPreviousPeriod)-100)*100)/100;

                        statsText= tipsCountCurrentPeriod + " tips have been sent through the @xrptipbot in the last " + this.timeframe + ".";
                        statsText+= "\nThat is " + (increaseOrDecrease > 0 ? "an increase 📈  of " + increaseOrDecrease : "a decrease 📉  of " + Math.abs(increaseOrDecrease)) + "% to the previous period."
                        statsText+= "\n\nPrevious period: " + tipsCountPreviousPeriod + " tips."
                    } else
                        this.generateRandomStatsTweet(from_orig, to_orig);

                } else
                    this.generateRandomStatsTweet(from_date, to_date);

                break;
            }
            //XRP comparission previous period
            case 14: {
                if(this.lastRandomNumberTime < 7) { 
                    let xrpAmountCurrentPeriod = await statsApi.getNumberOfXRPSent(from_date,to_date);
                    let from_orig:Date = new Date(from_date);
                    let to_orig:Date = new Date(to_date);

                    from_date = this.getPreviousPeriod(this.lastRandomNumberTime, from_date);
                    to_date = this.getPreviousPeriod(this.lastRandomNumberTime, to_date);

                    let xrpAmountPreviousPeriod = await statsApi.getNumberOfXRPSent(from_date,to_date);

                    if(xrpAmountPreviousPeriod > 0 && xrpAmountCurrentPeriod > 0) {
                        let increaseOrDecrease = Math.round(((xrpAmountCurrentPeriod*100/xrpAmountPreviousPeriod)-100)*100)/100;

                        statsText= xrpAmountCurrentPeriod + " #XRP have been sent through the @xrptipbot in the last " + this.timeframe + ".";
                        statsText+= "\nThat is " + (increaseOrDecrease > 0 ? "an increase 📈  of " + increaseOrDecrease : "a decrease 📉  of " + Math.abs(increaseOrDecrease)) + "% to the previous period."
                        statsText+= "\n\nPrevious period: " + xrpAmountPreviousPeriod + " $XRP."
                    } else
                        this.generateRandomStatsTweet(from_orig, to_orig);

                } else
                    this.generateRandomStatsTweet(from_date, to_date);

                break;
            }
            //unique users tips sent comparission prev period
            case 15: {
                if(this.lastRandomNumberTime < 7) { 
                    let uniqueUsersCurrentPeriod = await statsApi.callDistinctApi("user","?type=tip",from_date,to_date);
                    let from_orig:Date = new Date(from_date);
                    let to_orig:Date = new Date(to_date);

                    from_date = this.getPreviousPeriod(this.lastRandomNumberTime, from_date);
                    to_date = this.getPreviousPeriod(this.lastRandomNumberTime, to_date);

                    let uniqueUsersPreviousPeriod = await statsApi.callDistinctApi("user","?type=tip",from_date,to_date);

                    if(uniqueUsersPreviousPeriod > 0 && uniqueUsersCurrentPeriod > 0) {
                        let increaseOrDecrease = Math.round(((uniqueUsersPreviousPeriod*100/uniqueUsersCurrentPeriod)-100)*100)/100;

                        statsText= uniqueUsersPreviousPeriod + " unique users have sent a tip through the @xrptipbot in the last " + this.timeframe + ".";
                        statsText+= "\nThat is " + (increaseOrDecrease > 0 ? "an increase 📈  of " + increaseOrDecrease : "a decrease 📉  of " + Math.abs(increaseOrDecrease)) + "% to the previous period."
                        statsText+= "\n\nPrevious period: " + uniqueUsersCurrentPeriod + " unique users."
                    } else
                        this.generateRandomStatsTweet(from_orig, to_orig);

                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break; 
            }
            //unique users tips received comparission prev period
            case 16: {
                if(this.lastRandomNumberTime < 7) { 
                    let uniqueUsersCurrentPeriod = await statsApi.callDistinctApi("to","?type=tip",from_date,to_date);
                    let from_orig:Date = new Date(from_date);
                    let to_orig:Date = new Date(to_date);

                    from_date = this.getPreviousPeriod(this.lastRandomNumberTime, from_date);
                    to_date = this.getPreviousPeriod(this.lastRandomNumberTime, to_date);

                    let uniqueUsersPreviousPeriod = await statsApi.callDistinctApi("to","?type=tip",from_date,to_date);

                    if(uniqueUsersPreviousPeriod > 0 && uniqueUsersCurrentPeriod > 0) {
                        let increaseOrDecrease = Math.round(((uniqueUsersPreviousPeriod*100/uniqueUsersCurrentPeriod)-100)*100)/100;

                        statsText= uniqueUsersPreviousPeriod + " unique users have received a tip through the @xrptipbot in the last " + this.timeframe + ".";
                        statsText+= "\nThat is " + (increaseOrDecrease > 0 ? "an increase 📈  of " + increaseOrDecrease : "a decrease 📉  of " + Math.abs(increaseOrDecrease)) + "% to the previous period."
                        statsText+= "\n\nPrevious period: " + uniqueUsersCurrentPeriod + " unique users."
                    } else
                        this.generateRandomStatsTweet(from_orig, to_orig);

                } else
                    this.generateRandomStatsTweet(from_date, to_date);
                break; 
            }
            //get tipbot user count (tips only)
            case 17: {
                let uniqueUsersTipSent = await statsApi.callDistinctApi("user", "?type=tip");
                let uniqueUsersTipReceived = await statsApi.callDistinctApi("to", "?type=tip");

                let uniqueUsersTipDeposit = await statsApi.callDistinctApi("user", "?type=deposit");
                let uniqueUsersTipWithdrawal = await statsApi.callDistinctApi("user", "?type=withdraw");

                statsText = uniqueUsersTipSent + " unique users have sent a tip since the @xrptipbot creation in November 2017!"
                statsText+= "\nIn the same time, a whopping number of " + uniqueUsersTipReceived + " unique users have received a tip! 🎉";
                statsText+= "\n\n" + uniqueUsersTipDeposit + " have deposited."
                statsText+= "\n" + uniqueUsersTipWithdrawal + " have withdrawn."

                break;
            }
            //get tipbot user count overall (tips, deposits, withdrawals)
            case 18: {
                let uniqueUsersTipSentTwitter = await statsApi.callDistinctApi("user", "?user_network=twitter");
                let uniqueUsersTipSentDiscord = await statsApi.callDistinctApi("user", "?user_network=discord");
                let uniqueUsersTipSentReddit = await statsApi.callDistinctApi("user", "?user_network=reddit");
                let uniqueUsersTipSentCoil = await statsApi.callDistinctApi("user", "?user_network=coil");
                let uniqueUsersTipSentPaper = await statsApi.callDistinctApi("user", "?user_network=internal");

                statsText = "Overall active user count (by network):";
                statsText+= "\n('Active' means at least: sent a tip or did deposit/withdrawal)";
                statsText+= "\n\nTwitter: " + uniqueUsersTipSentTwitter;
                statsText+= "\nReddit: " + uniqueUsersTipSentReddit;
                statsText+= "\nDiscord: " + uniqueUsersTipSentDiscord;
                statsText+= "\nCoil: " + uniqueUsersTipSentCoil;
                statsText+= "\nPaperAccount: " + uniqueUsersTipSentPaper;
                break;
            }
            //get tipbot user count for timeframe (tips, deposits, withdrawals)
            case 19: {
                let uniqueUsersTipSentTwitter = await statsApi.callDistinctApi("user", "?user_network=twitter", from_date, to_date);
                let uniqueUsersTipSentDiscord = await statsApi.callDistinctApi("user", "?user_network=discord", from_date, to_date);
                let uniqueUsersTipSentReddit = await statsApi.callDistinctApi("user", "?user_network=reddit", from_date, to_date);
                let uniqueUsersTipSentCoil = await statsApi.callDistinctApi("user", "?user_network=coil", from_date, to_date);
                let uniqueUsersTipSentPaper = await statsApi.callDistinctApi("user", "?user_network=internal", from_date, to_date);

                statsText = "Active user count in the last " + this.timeframe+" :";
                statsText+= "\n('Active' means at least: sent a tip or did a deposit/withdrawal)";
                statsText+= "\n\nTwitter: " + uniqueUsersTipSentTwitter;
                statsText+= "\nReddit: " + uniqueUsersTipSentReddit;
                statsText+= "\nDiscord: " + uniqueUsersTipSentDiscord;
                statsText+= "\nCoil: " + uniqueUsersTipSentCoil;
                statsText+= "\nPaperAccount: " + uniqueUsersTipSentPaper;
                break;
            }
            //Unique users which received a tip overall
            case 20: {
                let uniqueUsersTipReceivedTwitter = await statsApi.callDistinctApi("to", "?type=tip&to_network=twitter");
                let uniqueUsersTipReceivedDiscord = await statsApi.callDistinctApi("to", "?type=tip&to_network=discord");
                let uniqueUsersTipReceivedReddit = await statsApi.callDistinctApi("to", "?type=tip&to_network=reddit");
                let uniqueUsersTipReceivedCoil = await statsApi.callDistinctApi("to", "?type=tip&to_network=coil");
                let uniqueUsersTipReceivedPaper = await statsApi.callDistinctApi("to", "?type=tip&to_network=internal");

                statsText = "Unique users which received a tip since the inception of the @xrptipbot (by network):";
                statsText+= "\n\nTwitter: " + uniqueUsersTipReceivedTwitter;
                statsText+= "\nReddit: " + uniqueUsersTipReceivedDiscord;
                statsText+= "\nDiscord: " + uniqueUsersTipReceivedReddit;
                statsText+= "\nCoil: " + uniqueUsersTipReceivedCoil;
                statsText+= "\nPaperAccount: " + uniqueUsersTipReceivedPaper;
                break;
            }
            //Unique users which received a tip for timeframe
            case 21: {
                let uniqueUsersTipReceivedTwitter = await statsApi.callDistinctApi("to", "?type=tip&to_network=twitter", from_date, to_date);
                let uniqueUsersTipReceivedDiscord = await statsApi.callDistinctApi("to", "?type=tip&to_network=discord", from_date, to_date);
                let uniqueUsersTipReceivedReddit = await statsApi.callDistinctApi("to", "?type=tip&to_network=reddit", from_date, to_date);
                let uniqueUsersTipReceivedCoil = await statsApi.callDistinctApi("to", "?type=tip&to_network=coil", from_date, to_date);
                let uniqueUsersTipReceivedPaper = await statsApi.callDistinctApi("to", "?type=tip&to_network=internal", from_date, to_date);

                statsText = "Unique users which received a tip in the last " + this.timeframe+" :";
                statsText+= "\n\nTwitter: " + uniqueUsersTipReceivedTwitter;
                statsText+= "\nReddit: " + uniqueUsersTipReceivedDiscord;
                statsText+= "\nDiscord: " + uniqueUsersTipReceivedReddit;
                statsText+= "\nCoil: " + uniqueUsersTipReceivedCoil;
                statsText+= "\nPaperAccount: " + uniqueUsersTipReceivedPaper;
                break;
            }
            default: {
                let allTips = await statsApi.callCountApi("?type=tip", from_date, to_date); 
                let appTips = await statsApi.callCountApi("?type=tip&network=app", from_date, to_date);
                let twitterTips = await statsApi.callCountApi("?type=tip&network=twitter", from_date, to_date);
                let redditTips = await statsApi.callCountApi("?type=tip&network=reddit", from_date, to_date);
                let discordTips = await statsApi.callCountApi("?type=tip&network=discord", from_date, to_date);
                let buttonTips = await statsApi.callCountApi("?type=tip&network=btn", from_date, to_date);

                statsText = "In the last " + this.timeframe + " " + (appTips*100/allTips).toFixed(2) + "% of all tips were sent via @xrptipbot App!";
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

    getPreviousPeriod(randomNumber:number, date:Date): Date {
        this.timeframe = "⏱️ "
        switch(randomNumber) {
            case 0: {
                date.setHours(date.getHours()-1);
                this.timeframe += "1h";
                break;
            }
            case 1: {
                date.setHours(date.getHours()-4);
                this.timeframe += "4h";
                break;
            }
            case 2: {
                date.setHours(date.getHours()-12);
                this.timeframe += "12h";
                break;
            }
            case 3: {
                date.setHours(date.getHours()-24);
                this.timeframe += "24h";
                break;
            }
            case 4: {
                date.setDate(date.getDate()-7); 
                this.timeframe += "WEEK";
                break;
            }
            case 5: {
                date.setMonth(date.getMonth()-1);
                this.timeframe += "MONTH";
                break;
            }
            case 6: {
                date.setMonth(date.getMonth()-6);
                this.timeframe += "6 MONTHS";
                break;
            }
            case 7: {
                date.setFullYear(date.getFullYear()-1);
                this.timeframe += "YEAR";
                break;
            }
            default: {
                date.setHours(date.getHours()-4);
                this.timeframe += "4h";
                break;
            }
        }

        this.timeframe+= " ⏱️"

        return date;
    }
    
    writeToConsole(message:string) {
        util.writeConsoleLog('[STAT_UPDATES] ', message);
    }
}