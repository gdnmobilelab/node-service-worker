class ServiceWorkerCache {
    match() {
        throw new Error("No caches available in node environment");
    }

    open() {
        throw new Error("No caches available in node environment");
    }

    keys() {
        throw new Error("No caches available in node environment");
    }
}

module.exports = ServiceWorkerCache;