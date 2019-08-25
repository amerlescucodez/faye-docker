# Faye Web Sockets in Docker

Run the Faye web sockets push notification engine in Docker using Redis to store connection information.

### Configurations

Create a `.faye.env.development` or a `.faye.env.production` file with the following contents:

```bash
cp .faye.env.sample .faye.env.development
```

Make sure you edit the `FAYE_PUSH_TOKEN` to something more secure than the default value:

```.env
FAYE_PUSH_TOKEN=generateyoursecuretokenhereandmakesureithasnumbersandlettersandissuperlong123happyface

FAYE_REDIS_HOST=redis
FAYE_REDIS_PORT=6397

FAYE_LOGGING=0
FAYE_PORT=4242
FAYE_MOUNT=/faye
FAYE_TIMEOUT=45

FAYE_SAME_ORIGIN_URL=
```

If you wish to restrict access to the network by requiring the origin come from a preferred safe domain, provide that domain in the `FAYE_SAME_ORIGIN_URL` parameter in the field.

### Flags

| Name | Info |
|------|------|
| `FAYE_PUSH_TOKEN` | Required token for servers to be able to push new notifications to Faye |
| `FAYE_REDIS_HOST` | The `name` of the _Redis_ host running inside the `docker-compose.yml` file |
| `FAYE_REDIS_PORT` | Default _Redis_ port. |
| `FAYE_LOGGING` | `0` disables logging, `1` enables logging ; handshakes and disconnects to be logged to STDOUT |
| `FAYE_PORT` | Default port that faye will bind to, naturally 42 is the answer of the universe, so... |
| `FAYE_MOUNT` | The endpoint where faye will be accessible: ie `http://faye.local:4242/faye` |
| `FAYE_TIMEOUT` | Default timeout for faye requests that take a long time. |
| `FAYE_SAME_ORIGIN_URL` | Restrict connections to faye except from origin requests with this specified domain: ie `mydomain.com` |
| `FAYE_USE_SSL` | `0` only use HTTP (port 80), `1` use both HTTP (port 80) and HTTPS (port 443) |
| `SSL_KEY_FILE` | Required if `FAYE_USE_SSL=1`, path to the SSL private key file |
| `SSL_CERT_FILE` | Required if `FAYE_USE_SSL=1`, path to the SSL Certificate file |
| `FAYE_SSL_PORT` | Required if `FAYE_USE_SSL=1`, specify the port to bind HTTPS to, default is 4443 |

### Debugging

```
curl -X POST http://localhost:4242/faye \
    -H 'Content-Type: application/json' \
    -d '{"channel": "/foo", "data": "Hello", "ext": {"pushToken": "generateyoursecuretokenhereandmakesureithasnumbersandlettersandissuperlong123happyface"}}'
````

Response: 

```
[{"channel":"/foo","successful":true}]
```

### Roadmap

Planning on the following enhancements to the repository: 

1. ~Secure behind HTTPS using `express`~
2. Access control for permitted front-end subscribers.
3. Add CSRF protection

### Using Docker Compose

```
version: "3.7"

services:
  redis:
    image: redis:alpine
    ports:
      - 6379:6379
    restart: unless-stopped
    networks:
      - primary

  faye:
    image: amerlescucodez/docker-faye-redis:1.0.1
    links:
      - redis
    depends_on:
      - redis
    restart: unless-stopped
    ports:
      - 4242:4242
      - 4443:4443
    env_file:
      - .faye.env.development
    volumes:
      - ./ssl:/etc/ssl/certs/faye
    networks:
      - primary


networks:
  primary:
```


### Adding SSL Certificate

You will need to modify your docker-compose file to the following: 

```yaml
faye:
  ...
  ports:
  	...
    - 4443:4443
  volumes:
    - ./ssl:/etc/ssl/certs/faye
  ...
```

The specified port `4443` needs to be specified inside the `FAYE_SSL_PORT` environment variable.

This also assumes that from the location of your `docker-compose.yaml` file a directory called `ssl` exists where the SSL key/certificate file are stored. This local directory needs to mount to the container destination of `/etc/ssl/certs/faye`.

Next you will need to edit your `.faye.env.development` file: 

```yaml
FAYE_USE_SSL=1
FAYE_SSL_PORT=4443

SSL_KEY_FILE=development.key
SSL_CRT_FILE=development.crt
```
**Important Note**: `SSL_KEY_FILE` and `SSL_CRT_FILE` need to be the filenames exactly as they appear inside the mounted volume that points to `/etc/ssl/certs/faye`, otherwise the server will not boot properly.

Next you will need to generate an SSL certificate 

```
$ cd ssl
$ openssl req -x509 -nodes -days 3650 -newkey rsa:4096 -keyout development.key -out development.crt

Generating a 4096 bit RSA private key
......++
....................................................................................................................++
writing new private key to 'development.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:US
State or Province Name (full name) []:New York
Locality Name (eg, city) []:New York
Organization Name (eg, company) []:Company
Organizational Unit Name (eg, section) []:Organization
Common Name (eg, fully qualified host name) []:localhost
Email Address []:webmaster@localhost
```

Test your SSL faye instance:

```
curl -X POST https://localhost:4443/faye -k \
    -H 'Content-Type: application/json' \
    -d '{"channel": "/foo", "data": "Hello", "ext": {"pushToken": "generateyoursecuretokenhereandmakesureithasnumbersandlettersandissuperlong123happyface"}}'
````

Response:

```
[{"channel":"/foo","successful":true}]
```
