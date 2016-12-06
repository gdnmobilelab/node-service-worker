const ServiceWorkerGlobalScope = require('./worker/serviceworker-global-scope');
const getAllKeys = require('./util/get-all-keys');
const FetchEvent = require('./worker/fetchevent');
const url = require('url');
const ExtendableEvent = require('./worker/extendable-event');
const fetch = require('node-fetch');

const installAndActivate = require('./util/install-and-activate');

class ServiceWorker {
    
    constructor({scriptURL, scope, contents}) {
        this.globalScope = new ServiceWorkerGlobalScope({scope});
        this.caches = this.globalScope.caches;
        this.globalScope.registration.scope = scope;

        // We need to grab items from our globalScope object and apply them to the 
        // actual global scope the worker will run in.
        let keysToApplyToGlobal = getAllKeys(this.globalScope);
        let objectsToApplyToGlobal = keysToApplyToGlobal.map((key) => {

            if (typeof this.globalScope[key] === "function") {
                // If it's a function we want to ensure that it stays bound
                // to the global scope object.
                return this.globalScope[key].bind(this.globalScope);
            } else {
                return this.globalScope[key];
            }
            
        });
        
        // We need to manually add self to this list. global shouldn't matter, but
        // if we don't redefine it, the worker can access the Node global scope
        keysToApplyToGlobal.unshift("global", "self");
        objectsToApplyToGlobal.unshift(undefined, this.globalScope);
        
        let swCreatorFunction = Function.apply(null, keysToApplyToGlobal.concat(contents));
        swCreatorFunction.apply(null, objectsToApplyToGlobal);

        // Then we add all our global scope entries to this object, too, so that
        // we can easily inspect the worker from code.

        keysToApplyToGlobal.forEach((key, i) => {
            this[key] = objectsToApplyToGlobal[i];
        });
    }

}

module.exports = {
    ServiceWorker,
    FetchEvent,
    ExtendableEvent,
    Request: fetch.Request,
    Response: fetch.Response,
    installAndActivate: installAndActivate
}