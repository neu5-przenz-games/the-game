const chai = require("chai");
const chaiHttp = require("chai-http");
const io = require("socket.io-client");
const server = require("../index");

const ioOptions = {
  transports: ["websocket"],
  forceNew: true,
  reconnection: false,
};

let socket;
const testHost = "http://localhost:5000/";

chai.use(chaiHttp);
chai.should();

describe("Server socket tests", () => {
  beforeEach((done) => {
    socket = io(testHost, ioOptions);
    socket.on("connect", () => {
      done();
    });
  });
  afterEach((done) => {
    if (socket.connected) {
      socket.disconnect();
    }
    done();
  });

  it("New player join and leave", (done) => {
    const newPlayer = io(testHost, ioOptions);
    socket.on("newPlayer", (newPlayermsg) => {
      newPlayermsg.should.have.keys(
        "facingDirection",
        "id",
        "isOnline",
        "socketId",
        "walkingAnimationMapping",
        "x",
        "y"
      );
      newPlayer.disconnect();

      socket.on("playerDisconnected", (playerDisconnectedMsg) => {
        playerDisconnectedMsg.should.have.lengthOf(20);
        done();
      });
    });
  });
});

describe("Server HTTP tests", () => {
  it("Main page content", (done) => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        chai.expect(err).to.not.exist; // eslint-disable-line
        res.should.have.status(200);
        res.should.have.property("body");
        done();
      });
  });
});
