# NMOS-Sender-Enabler

Activates all Senders of NMOS Devices triggered by Ember+ or WebFrontend via the NMOS IS-05 Connection API

## Run as a Container

There is built Version of this Container on [Docker Hub](https://hub.docker.com/r/adihilber/nmos-sender-enabler). It exposes Port 5000/tcp for http and Port 9000/tcp for Ember+, but the Ports could also be changed via Env-Vars `-e PORT=5001 -e EMBER_PORT=9001`. All of the configurations are stored in the [config/config.json](./config/config.json) so make sure to run your Container with a persistant Volume for this File `-v my-config:/app/config`.

Example Run Comand:

```Shell
docker run -d --name=NMOS-Sender-Enabler -p8080:5000 -p9000:9000 -v nmos-en-conf:/app/config adihilber/nmos-sender-enabler
```

Or as an Docker-Compse:

```Shell
version: "2"
services:
    nmos-sender-enabler:
        image: adihilber/nmos-sender-enabler:latest
        ports:
            - 8080:5000
            - 9000:9000
        environment:
            - NODE_ENV=production
        networks:
            - default
        volumes:
            - persistent:/app/config
volumes:
    persistent:
```
