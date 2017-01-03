var jade = require('jade');
var fs = require('fs');
var cookie = require('cookie');
var md5 = require('md5');

var chat = require('./chat');

exports = module.exports = function(app, io, config, con) {


    io.sockets.on('connection', function(socket) {




        socket.on('registration', function(submitData, callback) {


            //console.log(activeMembers);

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
                        errorMsg: "Email adderss " + submitData.email + " already exists."
                    });

                } else {

                    var data = {

                        fullname: submitData.name,
                        email: submitData.email,
                        password: md5(submitData.pass),
                        active: 1,

                    };



                    var query = con.query("INSERT INTO wp_chatusers set ? ", data, function(err, saveData) {

                        if (err)
                            console.log("Error inserting : %s ", err);
                        else {
                            callback({
                                status: true
                            });
                        }


                    });



                }


            });




            //callback({status : true, html : html});

        });




    });




}