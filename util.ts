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

export function getLinkTextOverall(from_date:Date, to_date:Date): string {
    let linkText = "\n\nFind more interesting stats here:\n";
    linkText+= "https://xrptipbot-stats.com/overallstatistics?from_date="+from_date.toISOString()+"&to_date="+to_date.toISOString();
    //linkText+= "\n\n(You can also deselect the preselected time 😇)";

    return linkText;
}

export function getLinkTextUser(stats:any, from_date:Date, to_date:Date): string {
    let linkText = "\n\nFind more interesting stats here:\n";
    linkText+= "https://xrptipbot-stats.com/userstatistics?user="+stats.userName+"&network="+stats['_id'].network+"&from_date="+from_date.toISOString()+"&to_date="+to_date.toISOString();
    //linkText+= "\n\n(You can also deselect the preselected time 😇)";

    return linkText;
}