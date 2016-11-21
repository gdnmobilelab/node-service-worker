const BrowserStyleEvents = require('./browser-style-events');
const EventEmitter = require('events').EventEmitter;
const fetch = require('node-fetch');
const CacheStorage = require('./cache-storage');

module.exports = class ServiceWorkerGlobalScope {
    constructor() {
        this.fetch = fetch;
        this.Request = fetch.Request;
        this.Response = fetch.Response;
        this._events = new EventEmitter();

        this.registration = {
            scope: ""
        }

        this.caches = new CacheStorage();
    }

    addEventListener(ev, listener) {
        return this._events.addListener(ev, listener)
    }

    removeEventListener(ev, listener) {
        return this._events.removeListener(ev, listener);
    }

    dispatchEvent(ev) {
        return this._events.emit(ev.type, ev);
    }
}