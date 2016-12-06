const url = require('url');

class DummyCache {

    constructor(name, scope) {
        this.name = name;
        this.scope = scope;
        this.entries = [];
    }

    add(urlToAdd) {
        this.entries.push(url.resolve(this.scope, urlToAdd));
    }

    addAll(urls) {
        urls.forEach((u) => this.add(u))
    }

    keys() {
        return this.entries;
    }

}

class ServiceWorkerCache {

    constructor(scope) {
        this.scope = scope;
        this.caches = [];
    }

    match() {
        return Promise.reject(new Error("No cache matching available in node environment"));
    }

    open(name) {

        let cacheInstance = this.caches.find((c) => c.name === name);

        if (!cacheInstance) {
            cacheInstance = new DummyCache(name, this.scope);
            this.caches.push(cacheInstance);
        }

        return Promise.resolve(cacheInstance);
    }

    keys() {
        return Promise.resolve(this.caches.map((c) => c.name));
    }
}

module.exports = ServiceWorkerCache;