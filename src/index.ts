import { Raptor } from "./Raptor";
import { AwayReply } from "./interfaces/Replies";

const raptor = new Raptor({
    //host: "irc.inet.tele.dk",
    host: "irc.efnet.nl",
    port: 6667,
    nick: "Raptorr222",
    user: "Raptor",
});

//const raptor = new Raptor({
//    host:"loud.farted.net",
//    port:7000,
//    ssl: true,
//    selfSigned: true,
//    nick:"JugNode",
//    user:"JugNode",
//    pass:"q03ea5vqTbfrXnhTwYuxFzAyHqFSESJSB9WXug8fgX2mHCa7"
//})

raptor.on("welcome", (data) => {
    console.log(`welcome got: ${data}`);
    raptor.write("JOIN #badbotsfuntime funtimes");
    //raptor.write("JOIN #juggerme")
});

raptor.on("kick", (data) => {
    console.log("kick", data);
});

raptor.on("mode", (data) => {
    console.log("mode", data);
});

raptor.on("message", (data) => {
    //console.log("msg",data);
});

raptor.on("notice", (data) => {
    console.log("notice", data);
});

raptor.connect();
