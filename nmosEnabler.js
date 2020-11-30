const fs = require('fs');
const http = require('http');
const isReachable = require('is-reachable');

const nmosPath = '/x-nmos/connection/v1.1/single/senders/';
const confFile = 'config/config.json';

const stringIsAValidUrl = (s) => {
  var protocols = ['http', 'https'];
  try {
    new URL(s);
    const parsed = parse(s);
    return protocols
      ? parsed.protocol
        ? protocols.map((x) => `${x.toLowerCase()}:`).includes(parsed.protocol)
        : false
      : true;
  } catch (err) {
    return false;
  }
};

class nmosEnabler {
  constructor(loggerFn) {
    if (typeof loggerFn === 'function') this._logFn = loggerFn;
    else this._logFn = console.log;
    this._nodes = JSON.parse(fs.readFileSync(confFile));
  }

  saveNodeConfig() {
    return new Promise((resolve, reject) => {
      let nodes = JSON.parse(JSON.stringify(this._nodes));
      nodes.map((node) => {
        delete node.reachable;
        delete node.error;
      });
      fs.writeFile(confFile, JSON.stringify(nodes, null, 2), (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(`Config File ${confFile} written.\n${data}`);
      });
    });
  }

  async addNode(name, url) {
    if (stringIsAValidUrl) {
      if (!this._nodes.some((node) => node.url === url)) {
        if (!name.trim()) throw `Node name ${name} is Empty. Not added.`;
        this._nodes.push({ name: name, url: url });
        await this.checkAllNodes();
        await this.saveNodeConfig();
        return `Node ${name} (${url}) added.`;
      } else throw `URL ${url} already in ConfigFile. Not added.`;
    } else {
      throw `URL ${url} is not a valid URL. Not added.`;
    }
  }

  async removeNode(url) {
    let index = this._nodes.findIndex((node) => node.url === url);
    if (index > -1) {
      let name = this._nodes[index].name;
      this._nodes.splice(index, 1);
      await this.saveNodeConfig();
      return `Node ${name} (${url}) removed.`;
    } else {
      throw `URL ${url} is not found. Not removed.`;
    }
  }

  getNodes() {
    return this._nodes;
  }

  makeRequest(url, method, data) {
    var dataStringified = JSON.stringify(data);
    if (!dataStringified) dataStringified = '';
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStringified),
        Accept: '*/*',
      },
    };
    return new Promise((resolve, reject) => {
      const req = http
        .request(url, options, (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode === 200) resolve(JSON.parse(data));
            else
              reject(
                `Request to ${url} with Method ${method} failed! Status=${res.statusCode} Body=${data}`
              );
          });
        })
        .on('error', (e) => {
          reject(`Request to ${url} with Method ${method} failed! Error=${e}`);
        });
      if (method != 'GET') {
        req.write(dataStringified);
      }
      req.end();
    });
  }

  async checkAllNodes() {
    var someOffline = false;
    await Promise.all(
      this._nodes.map(async (node) => {
        var reachable = await isReachable(node.url);
        node.reachable = reachable;
        if (!reachable) someOffline = true;
      })
    );
    return someOffline;
  }

  async getSenders(node) {
    if (node.reachable) {
      var senders = await this.makeRequest(
        `${node.url}${nmosPath}`,
        'GET'
      ).catch((e) => {
        node.error = true;
        throw `Node ${node.name} (${node.url}) can't get senders.\n${e}`;
      });
      return senders;
    } else {
      throw `Node ${node.name} (${node.url}) is not reachable`;
    }
  }

  async activateSender(node, sender) {
    let url = `${node.url}${nmosPath}${sender}staged`;
    var data = await this.makeRequest(url, 'GET');
    data.master_enable = true;
    data.activation.mode = 'activate_immediate';
    delete data.activation.activation_time;
    await this.makeRequest(url, 'PATCH', data);
    return `Node: ${node.name} (${node.url}) Sender ${sender} activated.`;
  }

  async run() {
    await this.checkAllNodes();
    let resultsPromises = await Promise.allSettled(
      this._nodes.map(async (node) => {
        node.error = false;
        let senders = await this.getSenders(node);
        let activatedPromises = await Promise.allSettled(
          senders.map(async (sender) => {
            return await this.activateSender(node, sender);
          })
        );
        const activated = activatedPromises
          .filter((p) => p.status === 'fulfilled')
          .map((promise) => {
            return promise.value;
          });
        this._logFn(activated.join('\n'));
        const errorArray = activatedPromises
          .filter((p) => p.status === 'rejected')
          .map((promise) => {
            return promise.reason;
          });
        if (errorArray.length) {
          node.error = true;
          throw `Failed to activate Sender from Node ${node.name} (${
            node.url
          }):\n${errorArray.join('\n')}`;
        }
      })
    );
    const errorArray = resultsPromises
      .filter((p) => p.status === 'rejected')
      .map((promise) => {
        return promise.reason;
      });
    if (errorArray.length) throw errorArray.join('\n\n');
  }
}

module.exports = { nmosEnabler };
