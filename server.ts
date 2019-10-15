import * as schedule from 'node-schedule';
import * as Stats from './api/statsApi';
import * as Twitter from './api/twitterApi';
import * as config from './config/config';
import * as util from './util';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

let twitterAPI:Twitter.TwitterApi;
let statsApi:Stats.StatsApi = new Stats.StatsApi();

initBot();

async function initBot() {
    //check if all environment variables are set
    try {
        if(!checkEnvironmentVariables()) {
            process.stdin.resume();
            return;
        }

        let initSuccessfull = await initTwitterAndTipbot();
        if(!initSuccessfull) {
            writeToConsole("Could not init twitter or tipbot. Bot not working.")
            process.stdin.resume();
        }
        //everything is ok. start the scheduling!
        else {
            schedule.scheduleJob('Every6hExecution',{hour: 0, minute: 5}, () => { collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 6, minute: 5}, () => { collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 12, minute: 5}, () => { collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 18, minute: 5}, () => { collect6hStats() });

            schedule.scheduleJob('DailyExecution', {hour: 0, minute: 6}, () => { collectDailyStats() });
        }
    } catch(err) {
        this.writeToConsole(JSON.stringify(err));
    }
}

async function collect6hStats() {
    let to_date = util.setZeroMinutes(new Date());
    let from_date = util.setZeroMinutes(new Date());
    from_date.setHours(from_date.getHours()-6);

    await generateOverallTweet("6h",from_date, to_date);

    await generateTopUserTweet("6h",from_date, to_date);
}

async function collectDailyStats() {
    let to_date = util.setZeroMinutes(new Date());
    let from_date = util.setZeroMinutes(new Date());
    from_date.setDate(from_date.getDate()-1);

    await generateOverallTweet("24h",from_date, to_date);

    await generateTopUserTweet("24h",from_date, to_date);
}

async function generateOverallTweet(timeframe:string, from_date: Date, to_date: Date): Promise<any> {
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
    twitterAPI.sendTweet(overallTweet);
}

async function generateTopUserTweet(timeframe:string, from_date:Date, to_date:Date): Promise<any> {
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
    twitterAPI.sendTweet(topStatsTweet);
}

async function initTwitterAndTipbot(): Promise<boolean> {
    try {
        writeToConsole("connecting twitter...")
        //init twitter and get friend list
        twitterAPI = new Twitter.TwitterApi(config.TWITTER_CONSUMER_KEY, config.TWITTER_CONSUMER_SECRET, config.TWITTER_ACCESS_TOKEN, config.TWITTER_ACCESS_SECRET);
        await twitterAPI.initTwitter();
        writeToConsole("twitter connected.")
    } catch(err) {
        //initialization failed
        writeToConsole("error: " + JSON.stringify(err));
        return false;
    }
    
    return true;
}

function checkEnvironmentVariables(): boolean {

    if(!config.TWITTER_CONSUMER_KEY)
        writeToConsole("Please set the TWITTER_CONSUMER_KEY as environment variable");

    if(!config.TWITTER_CONSUMER_SECRET)
        writeToConsole("Please set the TWITTER_CONSUMER_SECRET as environment variable");

    if(!config.TWITTER_ACCESS_TOKEN)
        writeToConsole("Please set the TWITTER_ACCESS_TOKEN as environment variable");

    if(!config.TWITTER_ACCESS_SECRET)
        writeToConsole("Please set the TWITTER_ACCESS_SECRET as environment variable");


    return !(!config.TWITTER_CONSUMER_KEY
                || !config.TWITTER_CONSUMER_SECRET
                    || !config.TWITTER_ACCESS_TOKEN
                        || !config.TWITTER_ACCESS_SECRET);
}

function writeToConsole(message:string) {
    util.writeConsoleLog('[MAIN] ', message);
}