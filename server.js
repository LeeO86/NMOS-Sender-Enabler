const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const { emit } = require('process');

const EmberServer = require('node-emberplus').EmberServer;

const { nmosEnabler } = require('./nmosEnabler');

const tree = [
  {
    identifier: 'NMOS-Enabler',
    children: [
      {
        identifier: 'Run',
        value: false,
        access: 'readWrite',
        nodeType: 'Parameter',
        type: 4,
      },
      {
        identifier: 'State',
        value: 'Started',
        access: 'readWrite',
        nodeType: 'Parameter',
        type: 3,
      },
    ],
  },
];

var logs = [];
function IntTwoChars(i) {
  return `0${i}`.slice(-2);
}
function timeNow() {
  let date_ob = new Date();
  let date = IntTwoChars(date_ob.getDate());
  let month = IntTwoChars(date_ob.getMonth() + 1);
  let year = date_ob.getFullYear();
  let hours = IntTwoChars(date_ob.getHours());
  let minutes = IntTwoChars(date_ob.getMinutes());
  let seconds = IntTwoChars(date_ob.getSeconds());
  return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
function logging(msg) {
  let string = `${timeNow()}:\n${msg}`;
  logs.push(string);
  io.emit('logEntry', string);
  console.log(string);
}

var nmosEn = new nmosEnabler(logging);

nmosEn.checkAllNodes();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log('App is listening on port ' + port);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('nodes', nmosEn.getNodes());
  socket.emit('prevLogs', logs);
  socket.on('run', () => {
    if (!Object.keys(runElement).length) return;
    io.emit('running', true);
    server.setValue(runElement, true);
  });
  socket.on('addNode', (node) => {
    let oldUrl = node.oldUrl;
    let name = node.name;
    let url = node.url;
    if (oldUrl == -1) {
      nmosEn
        .addNode(name, url)
        .then((s) => {
          socket.emit('addNodeRes', { success: true });
          io.emit('nodes', nmosEn.getNodes());
          logging(`Added Node from API: ${s}`);
        })
        .catch((e) => {
          socket.emit('addNodeRes', { success: false, error: e });
          logging(`Add Node from API failed: ${e}`);
        });
    } else {
      nmosEn
        .removeNode(oldUrl)
        .then(nmosEn.addNode(name, url))
        .then((s) => {
          socket.emit('addNodeRes', { success: true });
          io.emit('nodes', nmosEn.getNodes());
          logging(`Changed Node from API: ${s}`);
        })
        .catch((e) => {
          socket.emit('addNodeRes', { success: false, error: e });
          logging(`Change Node from API failed: ${e}`);
        });
    }
  });
  socket.on('removeNode', (node) => {
    let url = node.url;
    nmosEn
      .removeNode(url)
      .then((s) => {
        socket.emit('removeNodeRes', { success: true });
        io.emit('nodes', nmosEn.getNodes());
        logging(`Removed Node from API: ${s}`);
      })
      .catch((e) => {
        socket.emit('removeNodeRes', { success: false, error: e });
        logging(`Remove Node from API failed: ${e}`);
      });
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Ember+ Server
const emberPort = process.env.EMBER_PORT || 9000;
var runElement = {};
const root = EmberServer.JSONtoTree(tree);
const server = new EmberServer('0.0.0.0', emberPort, root);
server.on('error', (e) => {
  console.log('Server Error', e);
});
server.on('clientError', (info) => {
  console.log('clientError', info);
});
server.on('event', (txt) => {
  console.log('event: ' + txt);
});
server.on('value-change', (element) => {
  if (element.contents.identifier === 'Run') {
    if (element.contents.value) {
      let stateElement = element._parent.getElementByIdentifier('State');
      server
        .setValue(stateElement, 'running')
        .then(() => nmosEn.run())
        .then(() => {
          server.setValue(stateElement, 'Last Run: OK');
          server.setValue(element, false);
          io.emit('running', false);
          io.emit('nodes', nmosEn.getNodes());
        })
        .catch((err) => {
          server.setValue(stateElement, 'Last Run: Failed!');
          server.setValue(element, false);
          io.emit('running', false);
          io.emit('nodes', nmosEn.getNodes());
          logging(`Error:\n${err}`);
        });
    }
  }
});
server
  .listen()
  .then(() => {
    console.log('Ember+ listening on Port ' + emberPort);
    runElement = root.getElementByPath('0.0');
  })
  .catch((e) => {
    console.log(e.stack);
  });
