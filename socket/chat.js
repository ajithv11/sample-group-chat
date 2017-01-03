var jade = require('jade');
var fs = require('fs');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var datetime = require('node-datetime');
var md5 = require('md5');
var cookieSet = false;
var authorised = false;

var activeMembers = {};
activeMembers.userSocket = {};
activeMembers.nicknames = {};
activeMembers.emails = {};

//console.log(activeMembers);


var sess;

exports = module.exports = function(app, io, config, con) {

    //app.use(session({secret: 'mysecreatid', key: 'express.sid',resave: true, saveUninitialized: true}));




    io.sockets.on('connection', function(socket) {



        socket.on('initialize', function(submitData, callback) {
            //sess = socket.request.session;

            //console.log(socket.request.headers);
            //console.log(socket.handshake);
            //console.log(sess);
            //console.log("---------------------------------------------------------------");


            console.log(submitData);
            if (submitData.email != '') {

                Chats = {};
                lastId = 0;

                if (submitData.isGuest == 1) { // for guest

                    guestSql = "SELECT * FROM `wp_guestusers` WHERE email = '" + submitData.email + "' AND id = '" + submitData.userID + "'";

                    con.query(guestSql, function(err, userData) {

                        if (err) {

                        } else if (userData.length) {

                            socket.nickname = userData[0].email;
                            activeMembers.userSocket[socket.nickname] = socket;
                            activeMembers.emails[socket.nickname] = userData[0].email;
                            activeMembers.nicknames[socket.nickname] = userData[0].name;


                            con.query("SELECT wp_chatmessages.*,wp_chatusers.fullname as lname, wp_chatusers.email as lemail, wp_chatusers.is_guest as lguest, wp_guestusers.fullname as gname, wp_guestusers.email as gemail, wp_guestusers.is_guest as gguest  FROM wp_chatmessages LEFT JOIN wp_chatusers ON wp_chatusers.id = wp_chatmessages.sender_id LEFT JOIN wp_guestusers ON wp_guestusers.id = wp_chatmessages.sender_id ORDER BY wp_chatmessages.created DESC LIMIT 10  ", function(err, messages) {

                                if (err) {

                                } else if (messages.length) {



                                    for (var i = 0; i < messages.length; i++) {
                                        lastId = messages[i].id;
                                        Chats[i] = {};
                                        if (messages[i].is_guest == 0) {
                                            Chats[i]['fullName'] = messages[i].lname;
                                            Chats[i]['email'] = messages[i].lemail;
                                            Chats[i]['guest'] = 0;
                                        } else {
                                            Chats[i]['fullName'] = messages[i].gname;
                                            Chats[i]['email'] = messages[i].gemail;
                                            Chats[i]['guest'] = 1;
                                        }
                                        //Chats[i]['created'] = messages[i].created;
										Chats[i]['created'] = messages[i].created;
                                        Chats[i]['message'] = messages[i].message;
                                        Chats[i]['id'] = messages[i].id;
                                    }

                                    //console.log(Chats);

                                    fs.readFile('views/users/userChat.jade', 'utf8', function(err, data) {
                                        if (err) throw err;
                                        var fn = jade.compile(data);
                                        var html = fn({
                                            baseUrl: config.baseURL,
                                            messages: Chats
                                        });

                                        callback({
                                            status: true,
                                            email: userData[0].email,
                                            fullname: userData[0].fullname,
                                            html: html,
                                            Chats: Chats,
                                            lastId: lastId,
                                            userID: userData[0].id,
                                            loggedIn: true,
                                            isGuest: userData[0].is_guest
                                        });
                                    });


                                }

                            });




                        }

                    });

                } else {

                    userSql = "SELECT * FROM `wp_chatusers` WHERE email = '" + submitData.email + "' AND id = '" + submitData.userID + "'";
                    //console.log(userSql);
                    con.query(userSql, function(err, userData) {

                        if (err) {

                        } else if (userData.length) {
                            //console.log(userData);

                            socket.nickname = userData[0].email;
                            activeMembers.userSocket[socket.nickname] = socket;
                            activeMembers.emails[socket.nickname] = userData[0].email;
                            activeMembers.nicknames[socket.nickname] = userData[0].name;



                            con.query("SELECT wp_chatmessages.*,wp_chatusers.fullname as lname, wp_chatusers.email as lemail, wp_chatusers.is_guest as lguest, wp_guestusers.fullname as gname, wp_guestusers.email as gemail, wp_guestusers.is_guest as gguest  FROM wp_chatmessages LEFT JOIN wp_chatusers ON wp_chatusers.id = wp_chatmessages.sender_id LEFT JOIN wp_guestusers ON wp_guestusers.id = wp_chatmessages.sender_id ORDER BY wp_chatmessages.created DESC LIMIT 10  ", function(err, messages) {
                                //console.log(messages);
                                if (err) {

                                } else if (messages.length) {



                                    for (var i = 0; i < messages.length; i++) {
                                        lastId = messages[i].id;
                                        Chats[i] = {};
                                        if (messages[i].is_guest == 0) {
                                            Chats[i]['fullName'] = messages[i].lname;
                                            Chats[i]['email'] = messages[i].lemail;
                                            Chats[i]['guest'] = 0;
											
                                        } else {
                                            Chats[i]['fullName'] = messages[i].gname;
                                            Chats[i]['email'] = messages[i].gemail;
                                            Chats[i]['guest'] = 1;
                                        }
                                        Chats[i]['created'] = messages[i].created;
                                        Chats[i]['message'] = messages[i].message;
                                        Chats[i]['id'] = messages[i].id;
										
                                    }

                                    //console.log(Chats);

                                    fs.readFile('views/users/userChat.jade', 'utf8', function(err, data) {
                                        if (err) throw err;
                                        var fn = jade.compile(data);
                                        var html = fn({
                                            baseUrl: config.baseURL,
                                            messages: Chats
                                        });

                                        callback({
                                            status: true,
                                            email: userData[0].email,
                                            fullname: userData[0].fullname,
                                            html: html,
                                            Chats: Chats,
                                            lastId: lastId,
                                            loggedIn: true,
                                            userID: userData[0].id,
                                            isGuest: userData[0].is_guest
                                        });
                                    });


                                }

                            });

                        }

                    });

                }



            } else {

                //authorised = true;
                fs.readFile('views/users/logReg.jade', 'utf8', function(err, data) {
                    if (err) throw err;
                    var fn = jade.compile(data);
                    var html = fn({
                        baseUrl: config.baseURL
                    });


                    callback({
                        status: true,
                        html: html,
                        resetCookie: true
                    });

                });

            }



        });


        socket.on('login', function(submitData, callback) {

            //console.log(submitData);


            var checkSql = "SELECT * FROM wp_chatusers WHERE wp_chatusers.email = '" + submitData.email + "' AND wp_chatusers.password = '" + md5(submitData.pass) + "'";


            con.query(checkSql, function(err, rows) {

                if (err) {
                    rows = [];
                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: err + " : SQL error occurs."
                    });
                } else if (!rows.length) {


                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: "Invalid username or password."
                    });
                    //callback({status : true});




                } else if (submitData.email in activeMembers.userSocket) {

                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: "User already logged in"
                    });

                } else {

                    //console.log(rows);
                    socket.nickname = submitData.email;

                    activeMembers.userSocket[socket.nickname] = socket;
                    activeMembers.emails[socket.nickname] = submitData.email;
                    activeMembers.nicknames[socket.nickname] = rows[0].fullname;
                    //console.log(activeMembers);
                    //console.log(socket);

                    Chats = {};
                    lastId = 0;
                    con.query("SELECT wp_chatmessages.*,wp_chatusers.fullname as lname, wp_chatusers.email as lemail, wp_chatusers.is_guest as lguest, wp_guestusers.fullname as gname, wp_guestusers.email as gemail, wp_guestusers.is_guest as gguest  FROM wp_chatmessages LEFT JOIN wp_chatusers ON wp_chatusers.id = wp_chatmessages.sender_id LEFT JOIN wp_guestusers ON wp_guestusers.id = wp_chatmessages.sender_id ORDER BY wp_chatmessages.created DESC LIMIT 10  ", function(err, messages) {
                        //console.log(messages);
                        if (err) {

                        } else if (messages.length) {


                            //for (var i = messages.length; i >= 0; i--) {
                            for (var i = 0; i < messages.length; i++) {
                                lastId = messages[i].id;
                                Chats[i] = {};
                                if (messages[i].is_guest == 0) {
                                    Chats[i]['fullName'] = messages[i].lname;
                                    Chats[i]['email'] = messages[i].lemail;
                                    Chats[i]['guest'] = 0;
                                } else {
                                    Chats[i]['fullName'] = messages[i].gname;
                                    Chats[i]['email'] = messages[i].gemail;
                                    Chats[i]['guest'] = 1;
                                }
                                Chats[i]['created'] = messages[i].created;
                                Chats[i]['message'] = messages[i].message;
                                Chats[i]['id'] = messages[i].id;
                            }

                            //console.log(Chats);

                            fs.readFile('views/users/userChat.jade', 'utf8', function(err, data) {
                                if (err) throw err;
                                var fn = jade.compile(data);
                                var html = fn({
                                    baseUrl: config.baseURL,
                                    messages: Chats
                                });

                                callback({
                                    status: true,
                                    email: submitData.email,
                                    fullname: rows[0].fullname,
                                    html: html,
                                    Chats: Chats,
                                    lastId: lastId,
                                    userID: rows[0].id,
                                    isGuest: rows[0].is_guest
                                });
                            });


                        }

                    });

                }


            });

        });




        socket.on('guest-login', function(submitData, callback) {



            var checkSql = "SELECT * FROM wp_chatusers WHERE wp_chatusers.email = '" + submitData.email + "'";


            con.query(checkSql, function(err, rows) {

                if (err) {

                    rows = [];
                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: err + " : SQL error occurs."
                    });

                } else if (rows.length) {

                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: "Email address not available, please try another email."
                    });

                } else if (submitData.email in activeMembers.userSocket) {

                    callback({
                        status: false,
                        email: submitData.email,
                        errorMsg: "Email address not available, please try another email."
                    });

                } else {


                    var saveData = {

                        fullname: submitData.name,
                        email: submitData.email,
                        is_guest: 1,
                        active: 1

                    };

                    var query = con.query("INSERT INTO wp_guestusers set ? ", saveData, function(err, dat) {

                        //console.log(dat);

                        if (err)
                            console.log("Error inserting : %s ", err);
                        else {



                            socket.nickname = submitData.email;
                            activeMembers.userSocket[socket.nickname] = socket;
                            activeMembers.emails[socket.nickname] = submitData.email;
                            activeMembers.nicknames[socket.nickname] = submitData.name;


                            //console.log(activeMembers);
                            //callback({status : false, email : submitData.email, errorMsg : "User does not exists."});	

                            Chats = {};
                            lastId = 0;
                            con.query("SELECT wp_chatmessages.*,wp_chatusers.fullname as lname, wp_chatusers.email as lemail, wp_chatusers.is_guest as lguest, wp_guestusers.fullname as gname, wp_guestusers.email as gemail, wp_guestusers.is_guest as gguest  FROM wp_chatmessages LEFT JOIN wp_chatusers ON wp_chatusers.id = wp_chatmessages.sender_id LEFT JOIN wp_guestusers ON wp_guestusers.id = wp_chatmessages.sender_id ORDER BY wp_chatmessages.created DESC LIMIT 10  ", function(err, messages) {

                                if (err) {

                                } else if (messages.length) {


                                    for (var i = 0; i < messages.length; i++) {
                                        lastId = messages[i].id;
                                        Chats[i] = {};
                                        if (messages[i].is_guest == 0) {
                                            Chats[i]['fullName'] = messages[i].lname;
                                            Chats[i]['email'] = messages[i].lemail;
                                            Chats[i]['guest'] = 0;
                                        } else {
                                            Chats[i]['fullName'] = messages[i].gname;
                                            Chats[i]['email'] = messages[i].gemail;
                                            Chats[i]['guest'] = 1;
                                        }
                                        Chats[i]['created'] = messages[i].created;
                                        Chats[i]['message'] = messages[i].message;
                                        Chats[i]['id'] = messages[i].id;
                                    }



                                    fs.readFile('views/users/userChat.jade', 'utf8', function(err, data) {

                                        if (err) throw err;
                                        var fn = jade.compile(data);
                                        var html = fn({
                                            baseUrl: config.baseURL,
                                            messages: messages
                                        });
                                        callback({
                                            status: true,
                                            email: submitData.email,
                                            fullname: submitData.name,
                                            html: html,
                                            Chats: Chats,
                                            lastId: lastId,
                                            userID: dat.insertId,
                                            isGuest: 1
                                        });

                                    });

                                }

                            });

                        }


                    });




                }


            });

        });


        socket.on('send message', function(data, callback) {


            var typeMsg = data.typeMsg;
            var userEmail = data.userEmail;
            var fullName = data.fullName;


            if (userEmail in activeMembers.userSocket) {
				var dt = datetime.create();
				var fomratted = dt.format('Y:m:d H:M:S');

                var chatData = {

                    sender_id: data.userID,
                    message: typeMsg,
					created: fomratted,
                    is_guest: data.isGuest

                };
                var query = con.query("INSERT INTO wp_chatmessages set ? ", chatData, function(err, dat) {

                    //console.log(dat);

                    if (err) {
                        console.log("Error inserting : %s ", err);
                    } else {
						
						
						

                        io.sockets.emit('new message', {
                            typeMsg: typeMsg,
                            userEmail: userEmail,
							dateTime : fomratted,
                            fullName: fullName
                        });

                    }
                });




            } else {
                callback("Error: Please login agin to complete the request");
            }




        });


        socket.on('loadmore', function(data, callback) {

            Chats = {};
            lastId = 0;
            con.query("SELECT wp_chatmessages.*,wp_chatusers.fullname as lname, wp_chatusers.email as lemail, wp_chatusers.is_guest as lguest, wp_guestusers.fullname as gname, wp_guestusers.email as gemail, wp_guestusers.is_guest as gguest  FROM wp_chatmessages LEFT JOIN wp_chatusers ON wp_chatusers.id = wp_chatmessages.sender_id LEFT JOIN wp_guestusers ON wp_guestusers.id = wp_chatmessages.sender_id WHERE wp_chatmessages.id < '" + data.lastId + "' ORDER BY wp_chatmessages.created DESC LIMIT 10  ", function(err, messages) {

                if (err) {

                } else if (messages.length) {


                    for (var i = 0; i < messages.length; i++) {
                        lastId = messages[i].id;
                        Chats[i] = {};
                        if (messages[i].is_guest == 0) {
                            Chats[i]['fullName'] = messages[i].lname;
                            Chats[i]['email'] = messages[i].lemail;
                            Chats[i]['guest'] = 0;
                        } else {
                            Chats[i]['fullName'] = messages[i].gname;
                            Chats[i]['email'] = messages[i].gemail;
                            Chats[i]['guest'] = 1;
                        }
                        Chats[i]['created'] = messages[i].created;
                        Chats[i]['message'] = messages[i].message;
                        Chats[i]['id'] = messages[i].id;
                    }



                    callback({
                        status: true,
                        Chats: Chats,
                        lastId: lastId
                    });
                } else {
                    callback({
                        status: false
                    });
                }
            });
        });



        socket.on('disconnect', function(data) {



            if (!socket.nickname) return; //came to page and diconnect without picking name

            delete activeMembers.userSocket[socket.nickname];
            delete activeMembers.emails[socket.nickname];
            delete activeMembers.nicknames[socket.nickname];


            //console.log(activeMembers);


        });




    });




}