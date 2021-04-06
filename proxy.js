const express = require("express");
const path = require('path'); // traversing the directory path
const bodyParser = require('body-parser'); //parse the request body
var httpProxy = require('http-proxy'); //proxy module
const OpenApiValidator = require('express-openapi-validator');
const middleware = require('coexist-parser-proxy');

const app = express();
const apiSpec = path.join(__dirname, 'spec.yml');
var apiProxy = httpProxy.createProxyServer();
const port = 9090
var ignoreURLs = ['/framework/v1/read','/form/v1/read']
const API_SERVICE_URL = "http://localhost:8000";

app.use(middleware);

try {
    app.use(bodyParser.raw({limit: '500MB'}));
    app.use(bodyParser.json({type: 'application/json',inflate: true,limit: '500MB'}));
    app.use(bodyParser.json({type: 'application/gzip',inflate: true,limit: '500MB'}));
    app.use(bodyParser.raw({ type: 'application/vnd.custom-type',limit: '500MB' }));
    app.use(bodyParser.text({ type: 'text/html',limit: '500MB' }));
    app.use(bodyParser.urlencoded({
        extended: true,limit: '500MB'
    }));
    apiProxy.on('proxyRes', function (proxyRes, req, res) {
        console.log("Request URL: " + req.originalUrl);
        var body = [];
        proxyRes.on('data', function (chunk) {
            body.push(chunk);
        });
        proxyRes.on('end', function () {
            body = Buffer.concat(body).toString();
            console.log("res from proxied server:", body);
            try {
                res.json(JSON.parse(body));
            }
            catch (e) {
              app.use((err, req, res, next) => {
                                console.error("Request: "+req.url+" \nError: "+err);
                                res.status(err.status || 500).json({
                                message: err.message,
                                errors: err.errors,
                  });
              });

            }
        });
    });
    app.use(
        OpenApiValidator.middleware({
          apiSpec,
            validateRequests: false,
        })
    );
    app.use(function(req, res, next) {
        apiProxy.web(req, res, {target: API_SERVICE_URL, selfHandleResponse: true})
    });
    app.use((err, req, res, next) => {
                      console.error("Request: "+req.url+" \nError: "+err);
                      res.status(err.status || 500).json({
                      message: err.message,
                      errors: err.errors,
        });
    });
}
catch (e) {
    console.log("entering catch block as we caught an exception ", e);
    app.use((err, req, res, next) => {
                      console.error("Request: "+req.url+" \nError: "+err);
                      res.status(err.status || 500).json({
                      message: err.message,
                      errors: err.errors,
        });
    });
}


var server = app.listen(port, () => {
    console.log("Proxy Server running on port " + port);
});
