# service-worker-node

An attempt at replicating a Service Worker environment inside Node. Uses:

 - [node-fetch](https://www.npmjs.com/package/node-fetch) to emulate the Fetch API.
 - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB) as an in-memory store to
   replicate IndexedDB.

## Why would you make such an abomination?

First and foremost, as an experiment. But mostly to see if we can centralise
all page rendering inside a service worker. It will mean super-fast client loads,
and if we can replicate the environment well enough in Node it means we can
pre-populate pages on (e.g.) S3 for users when they first load.

## What works?

Very little. This is a project I'm adding to as and when I need more functionality.
Right now you can create a service worker like so:

    const {ServiceWorker} = require('node-service-worker');

    const sw = new ServiceWorker({
        scriptURL: 'https://localhost/sw.js',
        scope: 'http://localhost', // Primarily to resolve relative URLs
        contents: 'console.log("hi");' // The JS of the service worker
    })

You'll then want to install and activate your worker. For this we use `ExtendableEvent`s,
which have a **non-standard** function called `resolve()`, which will wait until a Promise
has executed, if `waitUntil()` has been called, or return immediately if not.

    const {ExtendableEvent} = require('node-service-worker');

    let installEvent = new ExtendableEvent("install");
    sw.dispatchEvent(installEvent);

    return installEvent.resolve()
    .then(() => {
        let activateEvent = new ExtendableEvent("activate");
        sw.dispatchEvent(activateEvent);
        return activateEvent.resolve();
    })

Then use the following:

### `FetchEvent`

Dispatch `FetchEvent`s to get page content:

    const {FetchEvent} = require('node-service-worker');

    let fetchEvent = new FetchEvent("http://localhost/test/");

    sw.dispatchEvent(fetchEvent);

    fetchEvent.resolve().then(function(response) {
        // a FetchResponse object, if you're doing it correctly.
    })

### `CacheStorage`

You can check which files your service worker has cached on install, using standard
`CacheStorage` APIs:

    sw.caches.keys()
    .then((keys) => {
        let openPromises = keys.map((key) => worker.caches.open(key));
        return Promise.all(openPromises);
    })
    .then((cacheObjects) => {
        let keysPromises = cacheObjects.map((c) => c.keys());
        return Promise.all(keysPromises);
    })
    .then((cacheEntryArrays) => {
        let allEntries = Array.prototype.concat.apply([], cacheEntryArrays);
        console.log(allEntries)
    })


## Gobble plugin

There's also a plugin available for [Gobble](https://github.com/gobblejs), allowing you
to include static HTML copies of service worker fetch events in your build process. Like so:

    var serviceWorkerRender = require('node-service-worker/gobble');
    
    gobble('src/js').transform(serviceWorkerRender, {
        entry: 'sw.js',
        scope: "https://localhost/app-demo/",
        urls: [
            "./",
            "./home/"
        ]
    })

Files are output relative to scope, so this example would create `index.html` and
`home/index.html` (index.html is added automaticallyto URLs ending with `/`).
