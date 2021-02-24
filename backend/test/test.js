'use strict'

var chai = require('chai')
  , chaiHttp = require('chai-http')
  , server = require('../index')
  , io = require('socket.io-client')
  , ioOptions = { 
      transports: ['websocket']
    , forceNew: true
    , reconnection: false
  }
  , server
  , socket
  , testHost = 'http://localhost:5000/'

chai.use(chaiHttp);
chai.should();

describe('Server socket tests', function(){
  beforeEach(function(done){
    socket = io(testHost, ioOptions)
    socket.on('connect', function() {
      done();
    });
  })
  afterEach(function(done){
    if(socket.connected) {
      socket.disconnect();
    }
    done();
  })

  it('New player join and leave', function(done) {
    let newPlayer = io(testHost, ioOptions);
    socket.on('newPlayer', function(msg){
      msg.should.have.key('playerId');
      newPlayer.disconnect();
      socket.on('playerDisconnected', function(msg){
        msg.should.have.lengthOf(20);
        done();
      })
    })
  })
})

describe('Server HTTP tests', function() {
  it('Main page content', function(done) {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        chai.expect(err).to.not.exist;
        res.should.have.status(200);
        res.should.have.property('body');
        done();
      });
  });
})
