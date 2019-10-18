import * as mqtt from 'mqtt';
import * as Twitter from '../api/twitterApi';
import * as config from '../config/config';
import * as util from '../util';

import consoleStamp = require("console-stamp");
consoleStamp(console, { pattern: 'yyyy-mm-dd HH:MM:ss' });

let mqttClient: mqtt.Client;

export class TipbotAlertsService {

    constructor(private twitterAPI: Twitter.TwitterApi) {}

    initMQTT() {
        mqttClient = mqtt.connect(config.MQTT_URL);
        mqttClient.on('connect', () => {
            //when connection sucessfull then subscribe to transactions for the user
            this.writeToConsole("MQTT connected. Subscribing to topics:");
            this.writeToConsole("subscribing to topic: " + 'tip/sent/*');
            this.writeToConsole("subscribing to topic: " + 'deposit/*');
            this.writeToConsole("subscribing to topic: " + 'withdraw/*');
            mqttClient.subscribe('tip/sent/*');
            mqttClient.subscribe('deposit/*');
            mqttClient.subscribe('withdraw/*');

            this.writeToConsole("Waiting for transactions...");
        });

        mqttClient.on('close', () => {
            this.writeToConsole("MQTT closed.");
        });

        mqttClient.on('error', err => {
            this.writeToConsole("MQTT not ready: " + err);
            process.stdin.resume();
        });

        mqttClient.on('message', async (topic, message) => {
            //new tip came in, start processing and checking.
            let newTip = JSON.parse(message.toString());

            try {
                if(newTip.type === 'tip' && newTip.xrp >= 400)
                    this.generateAlertMessageTip(newTip.xrp);
                else if(newTip.type === 'deposit' && newTip.xrp >= 1000)
                    this.generateAlertMessageDeposit(newTip.xrp);
                else if(newTip.type === 'withdraw' && newTip.xrp >= 900)
                    this.generateAlertMessageWithdraw(newTip.xrp);
            } catch(err) {
                this.writeToConsole(JSON.stringify(err));
            }
        });
    }

    generateAlertMessageTip(xrp: number): void {
        this.writeToConsole("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone just sent " + xrp + " $XRP via @xrptipbot! 🎉\n\n#XRPCommunity #XRPTipBot #XRP");

        this.twitterAPI.sendTweet("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone just sent " + xrp + " $XRP via @xrptipbot! 🎉\n\n#XRPCommunity #XRPTipBot #XRP")
    }

    generateAlertMessageDeposit(xrp: number): void {
        this.writeToConsole("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone has just deposited " + xrp + " $XRP into their @xrptipbot account! 🎉\n\n#XRPCommunity #XRPTipBot #XRP")

        this.twitterAPI.sendTweet("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone has just deposited " + xrp + " $XRP into their @xrptipbot account! 🎉\n\n#XRPCommunity #XRPTipBot #XRP")
    }

    generateAlertMessageWithdraw(xrp: number): void {
        this.writeToConsole("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone has just withdrawn " + xrp + " $XRP from their @xrptipbot account! 🎉\n\n#XRPCommunity #XRPTipBot #XRP");

        this.twitterAPI.sendTweet("📢 @xrptipbot 'whale alert' 📢 😄\n\nSomeone has just withdrawn " + xrp + " $XRP from their @xrptipbot account! 🎉\n\n#XRPCommunity #XRPTipBot #XRP")
    }

    writeToConsole(message:string) {
        util.writeConsoleLog('[MQTT] ', message);
    }
}