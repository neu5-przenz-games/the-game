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
const testHost = `http://localhost:${process.env.PORT}/`;

chai.use(chaiHttp);
chai.should();

describe("Player", () => {
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

  it("should have correct properties", (done) => {
    const socketClient = io(testHost, ioOptions);

    socket.on("player:new", (player) => {
      player.should.have.keys(
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

      socketClient.disconnect();
      done();
    });
  });

  it("should disconnect correctly", (done) => {
    const socketClient = io(testHost, ioOptions);

    socket.on("player:new", () => {
      socket.on("player:disconnected", (playerName) => {
        playerName.should.be.equal("player2");
        done();
      });

      socketClient.disconnect();
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
