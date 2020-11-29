# NMOS-Sender-Enabler
 Activates all Senders of NMOS Devices triggered by Ember+ or WebFrontend via the NMOS IS-05 Connection API
  
## Run as a Container
There is built Version of this Container on [Docker Hub](https://hub.docker.com/r/adihilber/nmos-sender-enabler). It exposes Port 5000/tcp for http and Port 9000/tcp for Ember+. All of the configurations are stored in the [config.json](./config.json) so make sure to run your Container with a persistant Volume for this File `-v my-config:/app/config.json`.  
  
Example Run Comand:
```Shell
docker run -d --name=NMOS-Sender-Enabler -p8080:5000 -p9000:9000 -v nmos-en-conf:/app/config.json adihilber/nmos-sender-enabler
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
        networks:
            - default
        volumes:
            - persistent:/app/config.json
volumes:
    persistent:
```
