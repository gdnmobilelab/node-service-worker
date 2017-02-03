const {ServiceWorker, installAndActivate, FetchEvent} = require('./index');
const url = require('url');
const path = require('path');
const fs = require('fs');

module.exports = function(input, output, options, callback) {
   
    let entryHasChanged = this.changes.find((c) => c.file === options.entry);

    let jsFile = path.join(input, options.entry);
    let scopePath = url.parse(options.scope).pathname;
    
    this.sander.readdir(input)
    .then((entries) => {
        let cpPromises = entries.map((e) => this.sander.symlinkOrCopy(input, e).to(output, e))
        return Promise.all(cpPromises)
    })
    // this.sander.symlinkOrCopy(input).to(output)
    .then(() => {
        // if (!entryHasChanged) {
        //     console.log("Skipping rebuild as entry has not changed")
        //     return false;
        // }
        console.log("Processing new service worker file...")
        return this.sander.readFile(jsFile, {encoding:'UTF-8'})
        .then((contents) => {

            let worker = new ServiceWorker({
                scriptURL: url.resolve(options.scope, "/" + options.entry),
                scope: options.scope,
                contents: contents,
                importScript: function(url) {
                    let entryDir = path.dirname(options.entry)
                    let relativeToScript = path.relative(options.entry, url);
                    return fs.readFileSync(path.join(input,entryDir, url));
                }
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
                        worker.globalScope.console.dump();
                        let parsedURL = url.parse(u);
                        let resolveBackToScope = path.relative(scopePath, parsedURL.path);
                    
                        // path.relative strips out trailing /, but we want it
                        if (resolveBackToScope !== "" && parsedURL.path.substr(-1) === '/') {
                            resolveBackToScope += '/';
                        }

                        if (resolveBackToScope.lastIndexOf("/") == resolveBackToScope.length -1) {
                            resolveBackToScope += "index.html";
                        }
                        console.log('scope?', resolveBackToScope)
                        let toWriteTo = path.resolve(output, resolveBackToScope);
                        return res.buffer()
                        .then((buffer) => {
                            console.log("write to", toWriteTo)
                            return this.sander.writeFile(toWriteTo, buffer);
                        });
                    })
                    
                });
                return Promise.all(fetchPromises);
            })
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