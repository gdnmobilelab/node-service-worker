const {ServiceWorker, installAndActivate, FetchEvent} = require('./index');
const url = require('url');
const path = require('path');

module.exports = function(input, output, options, callback) {
    
    let jsFile = path.join(input, options.entry);
    let scopePath = url.parse(options.scope).pathname;

    this.sander.copydir(input).to(output)
    .then(() => {
        return this.sander.readFile(jsFile, {encoding:'UTF-8'})
    })
    .then((contents) => {

        let worker = new ServiceWorker({
            scriptURL: url.resolve(options.scope, options.entry),
            scope: options.scope,
            contents: contents
        });

        return installAndActivate(worker)
        .then(() => {
            let absoluteURLsToFetch = options.urls.map((u) => url.resolve(options.scope, u));
            let fetchPromises = absoluteURLsToFetch.map((u) => {

                let fetchEvent = new FetchEvent(u);

                worker.dispatchEvent(fetchEvent);

                return fetchEvent.resolve()
                .catch((err) => {
                    console.error("Encoutered worker in worker.");
                    worker.globalScope.console.dump();
                    throw err;
                })
                .then((res) => {

                    let parsedURL = url.parse(u);
                    let resolveBackToScope = path.relative(scopePath, parsedURL.path);
                
                    // path.relative strips out trailing /, but we want it
                    if (resolveBackToScope !== "" && parsedURL.path.substr(-1) === '/') {
                        resolveBackToScope += '/';
                    }

                    if (resolveBackToScope.lastIndexOf("/") == resolveBackToScope.length -1) {
                        resolveBackToScope += "index.html";
                    }

                    let toWriteTo = path.resolve(output, resolveBackToScope);
                    return res.buffer()
                    .then((buffer) => {
                        return this.sander.writeFile(toWriteTo, buffer);
                    });
                })
                
            });
            return Promise.all(fetchPromises);
        })
        .catch((err) => {
            console.log('err?', err.stack)
            
            throw err;
        })
    })
    .then((responses) => {
        callback();
    })
    .catch((err) => {
        callback(err);
    })
};

module.exports.id = "node-service-worker";