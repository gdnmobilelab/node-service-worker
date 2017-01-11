const levels = ['info', 'log', 'error', 'warn'];
const {EventEmitter} = require('events');

module.exports = class Console extends EventEmitter {
    
    constructor() {
        super();
        this.entries = [];

        levels.forEach((level) => {
            this[level] = this._write(level);
        });

    }

    _write(level) {
        return function() {
            this.entries.push({
                level: level,
                args: arguments
            });

            let args = Array.from(arguments);
            args.unshift(level);
            this.emit.apply(this, args);
        }
    }

    dump() {
        this.entries.forEach((entry) => {
            console[entry.level].apply(console, entry.args);
        })
    }
}