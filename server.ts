import * as schedule from 'node-schedule';
import * as RecurringStats from './services/RecurringStats';
import * as TipbotAlerts from './services/TipbotAlerts';
import * as Twitter from './api/twitterApi';
import * as config from './config/config';
import * as util from './util';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

let twitterAPI:Twitter.TwitterApi;
let stat_service: RecurringStats.RecurringStatsService;
let tipbot_alerts: TipbotAlerts.TipbotAlertsService;

initBot();

async function initBot() {
    //check if all environment variables are set
    try {
        if(!checkEnvironmentVariables()) {
            process.stdin.resume();
            return;
        }

        let initSuccessfull = await initTwitter();
        if(!initSuccessfull) {
            writeToConsole("Could not init twitter or tipbot. Bot not working.")
            process.stdin.resume();
        }
        //everything is ok. start the scheduling!
        else {
            tipbot_alerts = new TipbotAlerts.TipbotAlertsService(twitterAPI);
            tipbot_alerts.initMQTT();

            stat_service = new RecurringStats.RecurringStatsService(twitterAPI)

            schedule.scheduleJob('Every6hExecution',{hour: 0, minute: 5}, () => { stat_service.collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 6, minute: 5}, () => { stat_service.collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 12, minute: 5}, () => { stat_service.collect6hStats() });
            schedule.scheduleJob('Every6hExecution', {hour: 18, minute: 5}, () => { stat_service.collect6hStats() });

            schedule.scheduleJob('DailyExecution', {hour: 0, minute: 6}, () => { stat_service.collectDailyStats() });
        }
    } catch(err) {
        this.writeToConsole(JSON.stringify(err));
    }
}

async function initTwitter(): Promise<boolean> {
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