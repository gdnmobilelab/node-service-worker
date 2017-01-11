# node-service-worker

An attempt at replicating a Service Worker environment inside Node. Uses:

 - [node-fetch](https://www.npmjs.com/package/node-fetch) to emulate the Fetch API.
 - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB) as an in-memory store to
   replicate IndexedDB.

Install with:

    npm install node-service-worker

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
which will wait until a Promise has executed, if `waitUntil()` has been called, or return 
immediately if not. They don't have an internal method of resolving in the spec, so we also 
have a function called resolveExtendableEvent that'll do it for us. Like so:

    const {ExtendableEvent, resolveExtendableEvent} = require('node-service-worker');

    let installEvent = new ExtendableEvent("install");
    sw.dispatchEvent(installEvent);

    return resolveExtendableEvent(installEvent)
    .then(() => {
        let activateEvent = new ExtendableEvent("activate");
        sw.dispatchEvent(activateEvent);
        return resolveExtendableEvent(activateEvent);
    })

A utility function is also provided for this, given that it's so common:

    const {installAndActivate} = require('node-service-worker');

    installAndActivate(sw)
    .then(() => {

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

Note that it doesn't (yet?) actually cache these files, it just stores which URLs are
cached.

### `console`

By default any calls to `console.log()` and the like are hidden from view. If you want to
see what was logged, you can call `console.dump()`. Best to use inside an error handler, like so:

    let install = new ExtendableEvent("install");
    sw.dispatchEvent(install);

    install.resolve()
    .catch((err) => {
        sw.console.dump();
    })

## Fetch interception

I'm still working out the best way to do this. But in browser service workers, the fetch() function
automatically bypasses the worker (otherwise you'd end up in infinite loops). We need to provide a hook
to do the same when using this as a server proxy. So, we can do the following:

    const sw = new ServiceWorker({
        scriptURL: 'https://localhost/sw.js',
        scope: 'http://localhost',
        contents: 'console.log("hi");',
        interceptFetch: function(fetchArgs, fetch) {
            // fetchArgs is an array of arguments passed. Fetch is the fetch function

            return fetch(fetchArgs[0], fetchArgs[1]) // this would mean we're doing nothing
        }
    })

to rewrite / do whatever we want to internal fetch requests.

## importScripts() interception

Similar to fetch, this is experimental and even trickier because it has to be synchronous. But any call
to `importScripts()` will be separated out into the individual scripts called (because it can contain
more than one argument) and passed to a function named importScript in the worker initialiser. Like so:

    const sw = new ServiceWorker({
        scriptURL: 'https://localhost/sw.js',
        scope: 'http://localhost',
        contents: 'console.log("hi");',
        importScript: function(url) {
            
            return fs.readFileSync(path.join(__dirname, url));

        }
    })

The example above assumes the URL is relative, which it may not be. For HTTP requests you might be able to use
something like https://github.com/ForbesLindesay/sync-request, but I wouldn't really recommend it.

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
`home/index.html` (index.html is added automatically to URLs ending with `/`).
