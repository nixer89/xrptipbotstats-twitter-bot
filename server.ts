import * as schedule from 'node-schedule';
import * as Stats from './api/statsApi';
import * as Twitter from './api/twitterApi';
import * as config from './config/config';
import * as util from './util';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

let twitterAPI:Twitter.TwitterApi;

let botAccounts:string[] = ['1059563470952247296', '1088476019399577602', '1077305457268658177', '1131106826819444736', '1082115799840632832', '1106106412713889792','52249814', '1038519523077484545'];
let noTweetUsers:string[] = ['1023321496670883840']

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
            let recurrenceRuleHourly:schedule.RecurrenceRule = new schedule.RecurrenceRule()
            recurrenceRuleHourly.minute = 5;
            schedule.scheduleJob('HourlyExecution', recurrenceRuleHourly, ()=>{ collectHourlyStats()});

            let recurrenceRuleDaily:schedule.RecurrenceRule = new schedule.RecurrenceRule()
            recurrenceRuleDaily.hour= 0;
            recurrenceRuleDaily.minute = 5;
            schedule.scheduleJob('DailyExecution', recurrenceRuleDaily, ()=>{ collectDailyStats()});
        }
    } catch(err) {
        this.writeToConsole(JSON.stringify(err));
    }
}

async function collectHourlyStats() {
    let to_date = util.setZeroMinutes(new Date());
    let from_date = util.setZeroMinutes(new Date());
    from_date.setHours(from_date.getHours()-1);

    await generateOverallTweet("hour",from_date, to_date);

    await generateTopUserTweet("hour",from_date, to_date);
}

async function collectDailyStats() {
    let to_date = util.setZeroHours(new Date());
    let from_date = util.setZeroHours(new Date());
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
    overallTweet+= amountOfXRPsent+" #XRP has been sent across.\n";
    overallTweet+= "ILP Deposits: " + ilpDepositsXRP + " $XRP.\n"
    overallTweet+= (highestDeposit ? "Highest Deposit: " + highestDeposit.xrp + " $XRP.":"");
    overallTweet+= (highestWithdraw ? "\nHighest Withdraw: " + highestWithdraw.xrp + " $XRP.":"");
    overallTweet+= util.getLinkTextOverall(from_date,to_date);

    console.log(overallTweet)
    twitterAPI.sendTweet(overallTweet);
}

async function generateTopUserTweet(timeframe:string, from_date:Date, to_date:Date): Promise<any> {
    let random:number = util.getRandomInt(4);
    let topStatsTweet:string = "@xrptipbot stats in the last "+timeframe+":\n\n";

    switch(random) {
        case 0: {
            let mostReceivedTips = await statsApi.getMostReceivedTips(from_date, to_date);
            topStatsTweet+= util.getUserNameNetwork(mostReceivedTips[0]) + " received the most tips in the last"+timeframe+": " + mostReceivedTips[0].count +" tips.\n\n";
            topStatsTweet+= util.getLinkTextUser(mostReceivedTips[0],from_date, to_date);
            break;
        }
        case 1: {
            let mostReceivedXRP = await statsApi.getMostReceivedXRP(from_date, to_date);
            topStatsTweet+= util.getUserNameNetwork(mostReceivedXRP[0]) + " received the most #XRP in the last "+timeframe+": " + mostReceivedXRP[0].xrp +" $XRP.\n\n";
            topStatsTweet+= util.getLinkTextUser(mostReceivedXRP[0],from_date, to_date);
            break;
        }
        case 2: {
            let mostSentTips = await statsApi.getMostSentTips(from_date, to_date);
            topStatsTweet+= util.getUserNameNetwork(mostSentTips[0]) + " sent the most tips in the last "+timeframe+": " + mostSentTips[0].count +" tips.\n\n";
            topStatsTweet+= util.getLinkTextUser(mostSentTips[0],from_date, to_date);
            break;
        }
        case 3: {
            let mostSentXRP = await statsApi.getMostSentXRP(from_date, to_date);
            topStatsTweet+= util.getUserNameNetwork(mostSentXRP[0]) + " sent the most #XRP in the last "+timeframe+": " + mostSentXRP[0].xrp +" $XRP.\n\n";
            topStatsTweet+= util.getLinkTextUser(mostSentXRP[0],from_date, to_date);
            break;
        }
    }

    console.log(topStatsTweet)
    twitterAPI.sendTweet(topStatsTweet);
}
async function initTwitterAndTipbot(): Promise<boolean> {
    try {
        writeToConsole("init REAL")
        //init twitter and get friend list
        twitterAPI = new Twitter.TwitterApi(config.TWITTER_CONSUMER_KEY, config.TWITTER_CONSUMER_SECRET, config.TWITTER_ACCESS_TOKEN, config.TWITTER_ACCESS_SECRET);
        await twitterAPI.initTwitter();
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