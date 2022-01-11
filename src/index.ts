import { Raptor } from './Raptor';

const raptor = new Raptor({
    host: "irc.inet.tele.dk",
    //host: "irc.efnet.nl",
    port: 6667,
    nick: "Raptorr222",
    user: "Raptor",
});

// const raptor = new Raptor({
//     host: 'loud.farted.net',
//     port: 7000,
//     ssl: true,
//     selfSigned: true,
//     nick: 'JugNode',
//     user: 'JugNode',
//     pass: 'q03ea5vqTbfrXnhTwYuxFzAyHqFSESJSB9WXug8fgX2mHCa7',
// });

// const spam = raptor.channel({
//     name: "badbotsfuntime",
//     fishKey: "cbc:b9SX8S7fvK659P4",
// });

const jug = raptor.channel({
    name: 'juggerme',
    fishKey: 'cbc:b9SX8S7fvK659P4',
});

raptor.on('welcome', (data: string) => {
    console.log(`welcome got: ${data}`);

    jug.join();
    jug.notice("FUN NOTICE!!");
    //jug.write('Im working!');
    jug.on('privmsg', (data) => {
        console.log(`in index i got: ${JSON.stringify(data)}`);
        //jug.write(`${data.from} you stupid fuck stop testing me!`);
    });
});

raptor.on('kick', (data) => {
    console.log('kick', data);
});

raptor.on('mode', (data) => {
    console.log('mode', data);
});

// raptor.on('privmsg', (data) => {
//     //spam.write(JSON.stringify(data));
//     //console.log("msg",data);
// });

raptor.on('notice', (data) => {
    console.log('notice', data);
});

raptor.connect();
