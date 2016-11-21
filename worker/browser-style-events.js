const EventEmitter = require('events').EventEmitter;

module.exports = class BrowserStyleEvents {
    constructor() {
        this.events = new EventEmitter();
    }

    addEventListener(ev, listener) {
        return this.events.addListener(ev, listener)
    }

    removeEventListener(ev, listener) {
        return this.events.removeListener(ev, listener);
    }

    dispatchEvent(ev) {
        return this.events.emit(ev.type, ev);
    }
}