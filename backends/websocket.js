/*jshint node:true, laxcomma:true */

var util = require('util');
const WebSocket = require('ws');

function WebsocketBeckend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  this.config = config.websocket || {};
  this.server = new WebSocket.Server({ port: this.config.port || 8080 });
  this.server.on('listening', () => {console.log('WebSocket listening')})
  this.server.on('connection', () => {console.log('WebSocket connection')})

  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

WebsocketBeckend.prototype.flush = function(timestamp, metrics) {
  console.log('Flushing stats at ', new Date(timestamp * 1000).toString());

  var out = {
    gauges: metrics.gauges
  };

  this.server.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send( JSON.stringify(out) );
    }
  });

};

WebsocketBeckend.prototype.status = function(write) {
  // ['lastFlush', 'lastException'].forEach(function(key) {
  //   write(null, 'console', key, this[key]);
  // }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new WebsocketBeckend(startupTime, config, events);
  return true;
};
