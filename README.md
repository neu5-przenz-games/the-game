# Development

Being in the `root` directory

to work locally first generate the mocks and map size by running
`yarn prebuild` (production)
`yarn prebuild:test`
`yarn prebuild:mini`

To work on the test map run
`yarn dev:test`

To start the server run
`yarn serve:dev`
and you should see page at
`localhost:5000`

The best way to test the production environment locally is to run
`NODE_ENV=production yarn build`
and then to start the server run
`yarn serve:prod`

## Demo

https://the-game1.herokuapp.com/

## Staging environment

https://the-game-staging.herokuapp.com/

### Profiling

To profile nodeJS server locally run
`yarn profile:node`
