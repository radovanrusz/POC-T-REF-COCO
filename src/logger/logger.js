const LVL_ERROR = 0;
const LVL_WARN = 1;
const LVL_INFO = 2;
const LVL_DEBUG = 3;
const LOG_LEVELS = [ ' ERROR:', ' WARN :', ' INFO :', ' DEBUG:' ];

module.exports = class Logger {
    
    static getLevel() {
        const levelStr = process.env.LOG_LEVEL || 'INFO';
        let level = LVL_INFO;
        switch (levelStr) {
        case 'ERROR': return LVL_ERROR;
        case 'WARN': return LVL_WARN;
        case 'INFO': return LVL_INFO;
        case 'DEBUG': return LVL_DEBUG;
        default: return LVL_INFO;
        }
    }

    static do_log(severity,text) {
        const currentLogLevel = this.getLevel();
        if(currentLogLevel>=severity) {
            const mDate = new Date();
            const mDateStr = mDate.toString('dddd MMM yyyy h:mm:ss') + LOG_LEVELS[severity];
            console.log(mDateStr,text);
        }
    }

    static debug() {
        this.do_log(LVL_DEBUG,Array.from(arguments).join(''));
    }

    static log() {
        this.do_log(LVL_INFO,Array.from(arguments).join(''));
    }

    static info() {
        this.do_log(LVL_INFO,Array.from(arguments).join(''));
    }

    static warn() {
        this.do_log(WARN,Array.from(arguments).join(''));
    }

    static error() {
        this.do_log(LVL_ERROR,Array.from(arguments).join(''));
    }
}
