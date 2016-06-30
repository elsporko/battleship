var http = require('http');
var express = require('express');

var server = http.createServer();
/*
 * var ip=getIP();
 * console.log("IP: " + ip);
 * server.listen(9999, getIP());
 * */
var ip='192.168.1.150';
console.log("IP: " + ip);
server.listen(9999, ip);

