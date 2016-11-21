class ServiceWorkerCache {
    match() {
        return Promise.reject(new Error("No caches available in node environment"));
    }

    open() {
        return Promise.reject(new Error("No caches available in node environment"));
    }

    keys() {
        return Promise.reject(new Error("No caches available in node environment"));
    }
}

module.exports = ServiceWorkerCache;