import { Raptor } from "./Raptor";
import { AwayReply } from "./interfaces/Replies";

const raptor = new Raptor({
    host: "irc.inet.tele.dk",
    port: 6667,
    nick: "Raptorr222",
    user: "Raptor",
});

raptor.on("welcome", (data) => {
    console.log(`welcome got: ${data}`);
});

raptor.on("away", (data: AwayReply) => {
    console.log(data);
});

raptor.on("message", (data) => {
    //console.log("msg",data);
});

raptor.connect();
