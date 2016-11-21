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

    const ServiceWorker = require('node-service-worker');

    const sw = new ServiceWorker(
        scriptURL: 'https://localhost/sw.js'
        scope: 'http://localhost', // Primarily to resolve relative URLs
        contents: 'console.log("hi");' // The JS of the service worker
    )

Then dispatch `FetchEvent`s:

    sw.dispatchFetchEvent('/test/')
    .then(function(response) {
        // a FetchResponse object, if you're doing it correctly.
    })