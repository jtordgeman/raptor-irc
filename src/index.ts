import { Raptor } from "./Raptor";

const raptor = new Raptor({
    host: "irc.inet.tele.dk",
    port: 6667,
    nick: "Raptorr",
    user: "Raptor",
});

raptor.connect();
raptor.on('welcome', (data) => {
    console.log(`welcome got: ${data}`);
})
