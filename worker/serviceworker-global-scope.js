const BrowserStyleEvents = require('./browser-style-events');
const EventEmitter = require('events').EventEmitter;
const fetch = require('node-fetch');
const CacheStorage = require('./cache-storage');
const applyIndexedDBTo = require('./indexeddb');
const Console = require('./console');

module.exports = class ServiceWorkerGlobalScope {
    constructor({scope, interceptFetch}) {

        if (interceptFetch) {
            this.fetch = function() {
                let ret = interceptFetch(arguments, fetch);

                if (!ret || !ret.then) {
                    return Promise.reject(new Error("You must return a promise in interceptFetch"));
                }

                return ret;

            }
        } else {
            this.fetch = fetch;
        }

        this.Request = fetch.Request;
        this.Response = fetch.Response;
        this._events = new EventEmitter();
        this.console = new Console();

        this.registration = {
            scope: scope
        }

        this.clients = {
            claim: function() {
                
            }
        }
        
        this.caches = new CacheStorage(scope);
        applyIndexedDBTo(this);
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

    skipWaiting() {

    }
};
