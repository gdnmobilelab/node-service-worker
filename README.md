# service-worker-node

An attempt at replicating a Service Worker environment inside Node.

## Why would you make such an abomination?

First and foremost, as an experiment. But mostly to see if we can centralise
all page rendering inside a service worker. It will mean super-fast client loads,
and if we can replicate the environment well enough in Node it means we can
pre-populate pages on (e.g.) S3 for users when they first load.

## What works?

Very little. This is a project I'm adding to as and when I need more functionality.
Right now you can create a service worker like so:

    const {ServiceWorker, FetchEvent} = require('node-service-worker');

    const sw = new ServiceWorker(
        scriptURL: 'https://localhost/sw.js'
        scope: 'http://localhost', // Primarily to resolve relative URLs
        contents: 'console.log("hi");' // The JS of the service worker
    )

Then dispatch `FetchEvent`s:

    let fetchEvent = new FetchEvent("http://localhost/test/")

    sw.dispatchEvent(fetchEvent)
    .then(function(response) {
        // a FetchResponse object, if you're doing it correctly.
    })

## Gobble plugin

There's also a plugin available for [Gobble](https://github.com/gobblejs), allowing you
to include static HTML copies of service worker fetch events in your build process. Like so:

    var serviceWorkerRender = require('node-service-worker/rollup');
    
    gobble('src/js').transform('rollup', {
        entry: 'sw.js',
        plugins: rollupPlugins
    }).transform(serviceWorkerRender, {
        entry: 'sw.js',
        scope: "https://localhost/app-demo/",
        urls: [
            "./",
            "./home/"
        ]
    })

Files are output relative to scope, so this example would create "index.html" and
"home/index.html" (index.html is added automatically).
