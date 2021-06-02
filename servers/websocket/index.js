const wsPort = 8000;
const webSocketServer = require('websocket').server
const http = require('http')

const server = http.createServer();
server.listen(wsPort)
console.log('websocket server listening on port 8000')

const wsServer = new webSocketServer({
    httpServer: server
})

const clients = {};

wsServer.on('request', function(request) {
  var clientID = getUniqueID();
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[clientID] = connection;
  console.log('connected: ' + clientID + ' in ' + Object.getOwnPropertyNames(clients))

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
        console.log('Received Message: ', message.utf8Data);

        for(key in clients) {
            clients[key].sendUTF(message.utf8Data);
            console.log('update forwarded to ', clients[key]);
        }
    }
  })
});

const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};