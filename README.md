vertex-node
===========
Vertex Node is a node.js driver for the VertexDb graph database.

Usage
=====
```js
var VertexClient = require('vertex-node');

var client = new VertexClient('localhost', 8080);

client.read(["path", "to", "your", "key"], function(value) {
    console.log(value);
})
```