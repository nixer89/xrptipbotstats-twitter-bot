//general
export const XRP_DROPS = 1000000;
//tipbot feed api
export const TIPBOT_FEED_API = process.env.TIPBOT_FEED_API || 'https://api.xrptipbot-stats.com/std-feed'
export const TIPBOT_ILP_API = process.env.TIPBOT_ILP_API || 'https://api.xrptipbot-stats.com/ilp-feed'
export const TIPBOT_COUNT_API = process.env.TIPBOT_COUNT_API || 'https://api.xrptipbot-stats.com/count'
export const TIPBOT_AGGREGATE_API = process.env.TIPBOT_AGGREGATE_API || 'https://api.xrptipbot-stats.com/aggregate'
export const TIPBOT_AGGREGATE_ILP_API = process.env.TIPBOT_AGGREGATE_ILP_API || 'https://api.xrptipbot-stats.com/aggregate-ilp'

//twitter api real
export const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
export const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
export const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
export const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
