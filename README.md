# Development

To work locally on test map (smaller map) run
`yarn dev:test`

To work locally on development version of a game run
`yarn dev`

To start the server run
`yarn serve`
and you should see page at
`localhost:5000`

The best way to test the production environment locally is to run
`NODE_ENV=production yarn build`
and then to start the server run
`yarn serve`

## Demo

https://the-game1.herokuapp.com/

## Staging environment

https://the-game-staging.herokuapp.com/

### Profiling

To profile nodeJS server locally run
`yarn profile:node`
