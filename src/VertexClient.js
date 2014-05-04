var http = require('http'), qs = require('qs');

function VertexClient(server, port) {
    this.server = server || "127.0.0.1";
    this.port = port || 8080;
}
VertexClient.prototype._resolvePath = function _resolvePath(path) {
    return (typeof path === "string")
        ? "/" + encodeURIComponent(path)
        : ((path instanceof Array)
        ? (function () {
        var tmp = "";
        for (var i = 0; i < path.length; i++) {
            tmp += "/" + encodeURIComponent(path[i]);
        }
        return tmp;
    })()
        : null
        );
};
VertexClient.prototype._resolvePathNode = function _resolvePathNode(path) {
    return (typeof path === "string")
        ? {path:"/", node:encodeURIComponent(path)}
        : ((path instanceof Array)
        ? (function () {
        var tmp = "";
        for (var i = 0; i < path.length - 1; i++) {
            tmp += "/" + encodeURIComponent(path[i]);
        }
        if (tmp === "") {
            tmp = "/";
        }
        return {path:tmp, node:encodeURIComponent(path[path.length - 1])};
    })()
        : null
        );
};

VertexClient.prototype._sendGet = function _sendGet(path, query, handler) {
    http.get({
        host: this.server,
        port: this.port,
        path: path + "?" + qs.stringify(query)
    }, function(response) {
        var data = "";
        response.on('data', function(chunk) {
            data += chunk.toString();
        });
        response.on('end', function() {
            handler(data);
        });
    });
};

VertexClient.prototype._sendPost = function _sendPost(path, query, data, handler) {
    var request = http.request({
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': data.length
        },
        host: this.server,
        method: "POST",
        port: this.port,
        path: path + "?" + qs.stringify(query)
    }, function(response) {
        var data = "";
        response.on('error', function(e) {
            debugger;
        });
        response.on('data', function(chunk) {
            data += chunk.toString();
        });
        response.on('end', function() {
            handler(data);
        });
    });
    request.on('error', function(e) {
        debugger;
    });
    request.write(data);
    request.end();
};

VertexClient.prototype.link = function link(fromPath, toPath, callback) {
    var toItem = this._resolvePathNode(toPath);
    this._sendGet(this._resolvePath(fromPath), {"action":"link", key: toItem.node, toPath: toItem.path}, function (response) {
        callback((response === "null") ? 0 : parseInt(response, 10));
    });

};

VertexClient.prototype.mkdir = function mkdir(path, callback) {
    this._sendGet(this._resolvePath(path), {"action":"mkdir"}, function (response) {
        if (response === "null") {
            callback(true);
        } else {
            callback(false);
        }
    });
};

/*VertexClient.prototype.queueExpireTo = function queueExpireTo() {

};

VertexClient.prototype.queuePopTo = function queuePopTo() {

};*/

VertexClient.prototype.read = function read(path, callback) {
    var item = this._resolvePathNode(path);
    this._sendGet(item.path, {"action":"read", key:item.node}, function (response) {
        callback(response);
    });
};

VertexClient.prototype.rm = function rm(path, callback) {
    var item = this._resolvePathNode(path);
    this._sendGet(item.path, {"action":"rm", key:item.node}, function (response) {
        if (response === "null") {
            callback(true);
        } else {
            callback(false);
        }
    });
};

/*VertexClient.prototype.select = function select() {

};*/

VertexClient.prototype.size = function size(path, callback) {
    this._sendGet(this._resolvePath(path), {"action":"size"}, function (response) {
            callback(parseInt(response, 10));
    });
};

/*VertexClient.prototype.transaction = function transaction() {

};*/

VertexClient.prototype.write = function write(path, value, append, callback) {
    var mode = (append) ? "append" : "set";
    var item = this._resolvePathNode(path);
    this._sendPost(item.path, {"action":"write", key:item.node, mode: mode}, value, function (response) {
        if (response === "null") {
            callback(true);
        } else {
            callback(false);
        }
    });
};

module.exports = VertexClient;