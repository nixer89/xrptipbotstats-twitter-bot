import * as shuffle from 'shuffle-array';
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
        else {
            collectHourlyStats();
        }
    } catch(err) {
        this.writeToConsole(JSON.stringify(err));
    }
}

async function collectHourlyStats() {
    let to_date = setZeroTime(new Date());
    let from_date = setZeroTime(new Date());
    from_date.setHours(from_date.getHours()-1);

    let tipsLastHour = await statsApi.getNumberOfTipsLastHour(from_date, to_date);
    let xrpSentLastHour = await statsApi.getNumberOfXRPSentLastHour(from_date, to_date);
}

function setZeroTime(date: Date): Date {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
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