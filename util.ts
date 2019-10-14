export function writeConsoleLog(prefixKey:string, message:string) {
    console.log(prefixKey + message);
}

export function getUserNameNetwork(stats:any): string {
    if("twitter"===stats['_id'].network)
        return "@"+stats.userName;
    else
        return stats.userName +" from " + stats['_id'].network;
}

export function setZeroHours(date: Date): Date {
    date.setHours(0);
    return setZeroMinutes(date);
}

export function setZeroMinutes(date: Date): Date {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
}

export function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function getRandomHashTag(): string {
    switch(getRandomInt(4)) {
        case 0: return '#XRPCommunity';
        case 1: return '#ownXRP';
        case 2: return '#XRPTheBase';
        case 3: return '#XRPTheStandard';
        default: return '#XRPCommunity';
    }
}

export function getLinkTextOverall(from_date:Date, to_date:Date): string {
    let linkText = "\n\nFind more interesting stats here:\n";
    linkText+= "https://xrptipbot-stats.com/overallstatistics?from_date="+from_date.toISOString()+"&to_date="+to_date.toISOString();
    linkText+= "\n\n"+getRandomHashTag();

    return linkText;
}

export function getLinkTextUser(stats:any, from_date:Date, to_date:Date): string {
    let linkText = "\n\nFind more interesting stats of " +getUserNameNetwork(stats)+ " here:\n";
    linkText+= "https://xrptipbot-stats.com/userstatistics?user="+stats.userName+"&network="+stats['_id'].network+"&from_date="+from_date.toISOString()+"&to_date="+to_date.toISOString();
    linkText+= "\n\n"+getRandomHashTag();

    return linkText;
}

export function dateToStringEuropeForAPI(dateToFormat: Date): string {
    return dateToFormat.toLocaleString("en-US", {timeZone: 'Europe/Berlin'} );
}