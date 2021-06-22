import chai from "chai";
import chaiHttp from "chai-http";
import io from "socket.io-client";
import server from "../index.mjs";

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
        "attack",
        "action",
        "actionDurationTicks",
        "actionDurationMaxTicks",
        "attackDelayTicks",
        "attackDelayMaxTicks",
        "backpack",
        "energyRegenDelayTicks",
        "energyRegenDelayMaxTicks",
        "direction",
        "isOnline",
        "name",
        "displayName",
        "equipment",
        "fraction",
        "socketId",
        "speed",
        "positionTile",
        "dest",
        "size",
        "x",
        "y",
        "toRespawn",
        "selectedPlayer",
        "selectedPlayerTile",
        "dropSelection",
        "settings",
        "next",
        "hp",
        "energy",
        "isDead",
        "isWalking"
      );
      newPlayer.disconnect();

      socket.on("playerDisconnected", (playerDisconnectedMsg) => {
        playerDisconnectedMsg.should.be.equal("player2");
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
