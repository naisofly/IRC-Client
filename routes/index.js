var channeldata = require('../lib/channeldata.json');
var irc = require('../lib/irc.js');

var app = require('express')();
/*var http = require('http').Server(app);
var io = require('socket.io')(http);*/

var count = 0;
var bot;
var message;
var ch = "";
var flash_message = "";


module.exports = function (app, passport,io,http) {

    io.on('connection', function (socket) {
        socket.on('chat message', function (msg) {
            io.emit('chat message', msg);
        });
    });
    http.listen(3001, function () {
        console.log('listening on *:3000');
    });




    app.get('/', function (req, res) {
        res.render('index', {title: 'Express'});
    });

    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login', {

        successRedirect: '/chat', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/login', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    app.get('/joinch/:ch?', isLoggedIn, function (req, res) {
        var channels = [];
        var users = [];
        channels = channeldata;
        ch = req.param('ch');

        /*console.log(req.route);*/

        if (typeof(ch) !== 'undefined' && ch !== null) {
            console.log("Channel to JOIN: " + ch);
            bot.opt.channels.forEach(function (currentChannel) {

                console.log("Parting current channel: ", currentChannel);
                bot.part(currentChannel);
            });
            bot.join(ch);
            /*bot.names(ch);*/
        }

        res.render('chat.ejs', {
            user: req.user,
            channellist: channels // get the user out of session and pass to template
        });
    });

    app.get('/chat', isLoggedIn, function (req, res) {

        var channels = [];
        var users = [];
        channels = channeldata;
        /*channeldata.forEach(function(item) {
         channels = channels.concat(item);



         });*/

        if (count < 1) {
            bot = new irc.Client('chat.us.freenode.net', req.user.local.nickname, {
                debug: true,
                channels: [/*'#test', */'#othertest']

            });
            count++;

            bot.addListener('pm', function (nick, message) {
                console.log('Got private message from %s: %s', nick, message);
                flash_message = "Got private message from " + nick + ": " + message;
                io.emit('notifications', flash_message);
            });
            bot.addListener('join', function (channel, who) {
                console.log('%s has joined %s', who, channel);
                flash_message = who + " has joined " + channel;
                io.emit('notifications', flash_message);
            });
            bot.addListener('part', function (channel, who, reason) {
                console.log('%s has left %s: %s', who, channel, reason);
                flash_message = who + " has left " + channel + ": " + reason;
                io.emit('notifications', flash_message);
            });
            bot.addListener('kick', function (channel, who, by, reason) {
                console.log('%s was kicked from %s by %s: %s', who, channel, by, reason);
                flash_message = who + " was kicked from " + channel + " by " + by + ": " + reason;
                io.emit('notifications', flash_message);
            });
            bot.addListener('topic', function (channel, topic, nick,message) {
                console.log('%s changed the topic of %s to: %s', nick, channel, topic);
                flash_message = nick + " changed the topic of " + channel + " to: " + topic;
                io.emit('notifications', flash_message);
            });
            bot.addListener('notice', function (from,to,text,message) {
                console.log('Got notice from %s: %s', from, message);
                flash_message = 'GOT notice from '+ from + ": " + text ;
                io.emit('notifications', flash_message);
            });
            bot.addListener('error', function (message) {
                console.error('ERROR: %s: %s', message.command, message.args.join(' '));
                flash_message = "ERROR: " + message.command + ": " + message.args.join(' ');
                io.emit('notifications', flash_message);
            });
            bot.addListener('message', function (from, to, message) {
                console.log('%s => %s: %s', from, to, message);
                io.emit('incoming_chat message', message);
            });

            bot.addListener('names', function (args, userList) {
                console.log("index " + args);
                Object.keys(userList).forEach(function (item) {
                    console.log(item);
                    io.emit('list_users', item);

                });

            });
        }








        res.render('chat.ejs', {
            user: req.user,
            channellist: channels // get the user out of session and pass to template
        });

    });

    app.post('/chat', function (req, res) {
        /*console.log(req.body.msg);*/
        var msgContent = req.body.msg;
        /*console.log("post req" + msgContent);*/
        if (msgContent.toString().toLowerCase().indexOf("/topic") >= 0) {
            var channel = msgContent.split(/\s+/).slice(1, 2).toString();
            var newTopic = msgContent.split(/\s+/).slice(2).join(" ");
            bot.topic(channel, newTopic);
            //TODO: no such channel OR you're not in the channel
        }

        else if (msgContent.toString().toLowerCase().indexOf("/notice") >= 0) {
            var targetNick = msgContent.split(/\s+/).slice(1, 2).toString();
            var noticeMsg = msgContent.split(/\s+/).slice(2).join(" ");
            bot.notice(targetNick, noticeMsg);

        }


        else if (msgContent.toString().toLowerCase().indexOf("/whois") >= 0) {
            var targetNick = msgContent.split(/\s+/).slice(1, 2).toString();
            bot.whois(targetNick);
            //TODO: handle  whois errors - no such nickname/channel
        }

        else
            bot.say(bot.opt.channels[0], msgContent);

        var channels = [];
        var users = [];
        channels = channeldata;
        res.render('chat.ejs', {
            user: req.user,// get the user out of session and pass to template
            channellist: channels
        });
    });

    app.get('/dashboard', isLoggedIn, function (req, res) {
        res.render('dashboard.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}