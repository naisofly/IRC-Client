var channeldata = require('../lib/channeldata.json');
var irc = require('../lib/irc.js');

var bot;

module.exports = function (app, passport) {

    app.locals({
        initConnection: function (name) {
            bot = new irc.Client('chat.us.freenode.net', name, {
                debug: true,
                channels: [/*'#test', */'#othertest']
            });
        }
    })
    ;

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


    app.get('/chat', isLoggedIn, function (req, res) {

        var channels = [];
        var users = [];
        channels = channeldata;
        /*channeldata.forEach(function(item) {
         channels = channels.concat(item);

         });*/
        res.render('chat.ejs', {
            user: req.user,
            channellist: channels // get the user out of session and pass to template
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