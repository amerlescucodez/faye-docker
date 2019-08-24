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
| `FAYE_MOUNT` | The endpoint where faye will be accessible: ie `http://localhost:4242/faye` |
| `FAYE_TIMEOUT` | Default timeout for faye requests that take a long time. |
| `FAYE_SAME_ORIGIN_URL` | Restrict connections to faye except from origin requests with this specified domain: ie `mydomain.com` |

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

1. Secure behind HTTPS using `express`
2. Access control for permitted front-end subscribers.
3. Add CSRF protection




