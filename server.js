
var express = require('express'),
path = require('path');

var argv = require('optimist')
.usage("Visualize scripts.\nUsage: $0")
.options({
  'p': {
    alias: 'port',
    desc: 'port number to listen on'
  }
})
.argv;

var app = express();

app.use(express.static( path.join(__dirname, 'public') ));
app.use(express.bodyParser());

var port = argv.port || 8080
app.listen(port, function () {
  console.log("Listening on " + port);
});
