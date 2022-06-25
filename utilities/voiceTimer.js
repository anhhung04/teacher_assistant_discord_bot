const timers = new Map();

module.exports ={
    startVoiceTimer(userId){
        let startTime = Number(Date.now());
        timers.set(userId, startTime);
    },
    getTime(userId){
        return timers.get(userId);
    }, resetTime(userId){
        return timers.set(userId, 0);
    }, increaseTime(userId, time){
        let oldTime = timers.get(userId);
        return timers.set(userId, oldTime+ Number(time));
    },
    stopWatch(userId){
        let now = Date.now();
        let oldTime = timers.get(userId);
        timers.set(userId, now- oldTime);
        return now- oldTime;
    }, resumeWatch(userId){
        let oldTime = timers.get(userId);
        let now = Date.now();
        timers.set(userId, now-oldTime);
    }

}