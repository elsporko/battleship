var http = require('http');
var express = require('express');
var sockjs = require('sockjs');

var echo = sockjs.createServer({});
echo.on('connection', function(conn) {
        conn.on('data', function(message) {
                    conn.write(message);
                        });
            conn.on('close', function() {});
});

var server = http.createServer();
echo.installHandlers(server, {prefix:'/echo'});
/*
 * var ip=getIP();
 * console.log("IP: " + ip);
 * server.listen(9999, getIP());
 * */
var ip='192.168.1.150';
console.log("IP: " + ip);
server.listen(9999, ip);

