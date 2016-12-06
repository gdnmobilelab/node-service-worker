const ServiceWorkerGlobalScope = require('./worker/serviceworker-global-scope');
const getAllKeys = require('./util/get-all-keys');
const FetchEvent = require('./worker/fetchevent');
const url = require('url');
const ExtendedEvent = require('./worker/extended-event');


class ServiceWorker {
    
    constructor({scriptURL, scope, contents}) {
        this.globalScope = new ServiceWorkerGlobalScope({scope});
        this.caches = this.globalScope.caches;
        this.globalScope.registration.scope = scope;

        let keysToApplyToGlobal = getAllKeys(this.globalScope);
        let objectsToApplyToGlobal = keysToApplyToGlobal.map((key) => this.globalScope[key]);
        
        // We need to manually add self to this list. global shouldn't also exist, but
        // if we don't redefine it, the worker can access the Node global scope
        keysToApplyToGlobal.unshift("global", "self");
        objectsToApplyToGlobal.unshift(this.globalScope, this.globalScope);
        
        let swCreatorFunction = Function.apply(null, keysToApplyToGlobal.concat(contents));
        swCreatorFunction.apply(null, objectsToApplyToGlobal);
    }
    dispatchEvent(ev) {
        this.globalScope.dispatchEvent(ev);
        return ev.resolve()
    }

}

module.exports = {
    ServiceWorker,
    FetchEvent,
    ExtendedEvent
}