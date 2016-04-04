var channeldata = require('../lib/channeldata.json');
var irc = require('../lib/irc.js');
var count = 0;
var bot;
var message;
var ch ="";

module.exports = function (app, passport) {

    app.locals({
        initConnection: function (name) {
            if (count < 1) {
                bot = new irc.Client('chat.us.freenode.net', name, {
                    debug: true,
                    channels: [/*'#test', */'#othertest']

                });
                count++;
            }
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
            bot.addListener('error', function (message) {
                console.error('ERROR: %s: %s', message.command, message.args.join(' '));
            });
            bot.addListener('message', function (from, message) {
                console.log('<%s> %s', from, message);
            });
        },

        sendMess: function (message) {
            bot.say("#othertest", message);
        }
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

        console.log("ROUTE", req.route);

        if (typeof(ch) !== 'undefined' && ch!==null ) {
            console.log("Channel to JOIN" + ch);
            bot.opt.channels.forEach(function(item) {
                console.log("channel log --->", item);
                bot.part(item);
            });
            bot.join(ch);
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

        var ch = req.param('ch');

        if (typeof(ch) !== 'undefined' && ch!==null ) {
            console.log("Channel to JOIN" + ch);
            bot.join(ch);
        }
        res.render('chat.ejs', {
            user: req.user,
            channellist: channels // get the user out of session and pass to template
        });

    });

    app.post('/chat', function (req, res) {
        /*console.log(req.body.msg);*/
        var msgContent = req.body.msg;

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
            bot.say("#othertest", msgContent);

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