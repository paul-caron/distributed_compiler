# distributed_compiler

## setup

```sh
chmod 777 install.sh
./install.sh
```

## requirements

- nodejs
- npm
- docker

## run

To start the server:

```sh
(cd server/ && node index.js)
```

To start a client compiler:

```sh
(cd client/ && node index.js)
```

To run the emitter for testing:

```sh
(cd emitter/ && node index.js)
```
