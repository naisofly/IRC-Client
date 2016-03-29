#!/usr/bin/env node
var irc = require('./lib/irc.js');
/*var bot;

function initConn(irnick) {
    bot = new irc.Client('chat.us.freenode.net', irnick, {
        debug: true,
        channels: [/!*'#test', *!/'#othertest']
    });
    alert("using bot.js");

}*/


/* PROCESSING USER INPUT from console - stdin */
var stdin = process.openStdin();

stdin.addListener("data", function (d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    /*console.log("you entered: [" + d.toString().trim() + "]");*/
    if (d.toString().indexOf("/join") >= 0)                     // channel tab
        bot.join("#heriot");
    if (d.toString().indexOf("/list") >= 0)
        bot.list();
    if (d.toString().indexOf("/topic") >= 0)
        bot.topic("#heriot", "max");
    if (d.toString().indexOf("/names") >= 0)                    // People tab in chat.ejs
        bot.names("#othertest");
    if (d.toString().indexOf("/notice") >= 0)
        bot.notice("anon2405", "testing notice");
    if (d.toString().indexOf("/part") >= 0)                     // channel tab
        bot.part("#othertest");
    if (d.toString().indexOf("/whois") >= 0)
        bot.whois("anon2405");
    else
        bot.say("#othertest", d.toString().trim());

});

bot.addListener('error', function (message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

bot.addListener('message', function (from, message) {
    console.log('<%s> %s', from, message);
});

bot.addListener('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    if (to.match(/^[#&]/)) {
        // channel message
        if (message.match(/the/i)) {
            /*bot.say(to, '******* TESTING BOT: Please ignore this message ***************' + from);*/

        }
        if (message.match(/dance/)) {
            setTimeout(function () {
                bot.say(to, '\u0001ACTION dances: :D\\-<\u0001');
            }, 1000);
            setTimeout(function () {
                bot.say(to, '\u0001ACTION dances: :D|-<\u0001');
            }, 2000);
            setTimeout(function () {
                bot.say(to, '\u0001ACTION dances: :D/-<\u0001');
            }, 3000);
            setTimeout(function () {
                bot.say(to, '\u0001ACTION dances: :D|-<\u0001');
            }, 4000);
        }
    }
    else {
        // private message
        console.log('private message');
    }
});
bot.addListener('pm', function (nick, message) {
    console.log('Got private message from %s: %s', nick, message);
});
bot.addListener('join', function (channel, who) {
    console.log('%s has joined %s', who, channel);
});
bot.addListener('part', function (channel, who, reason) {
    console.log('%s has left %s: %s', who, channel, reason);
});
bot.addListener('kick', function (channel, who, by, reason) {
    console.log('%s was kicked from %s by %s: %s', who, channel, by, reason);
});