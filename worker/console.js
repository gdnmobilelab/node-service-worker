const levels = ['info', 'log', 'error', 'warn'];

module.exports = class Console {
    
    constructor() {
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
        }
    }

    dump() {
        for (entry in this.entries) {
            console[entry.level].apply(console, entry.args);
        }
    }
}