var socket = io.connect();
jQuery( document ).ready(function($) {

	
	
	
	setTimeout(function(){
	
		socket.emit('new user', {username : clientUser, value : 'clientUsers'},function(data){
			//console.log(data);										
		});												
						
	}, 500);
	


	socket.on('usernames',function(data){

		var html     = '';
		var chatHtml = '';
		
		for(i=0;i<data.allUsers.length;i++){
			

			
			if(data.loggedUsers.indexOf(data.allUsers[i].user_login) < 0){ // for not loggedin memebers
				
				html+='<li class="users"><div class="individuals"><div class="photo-left"><div class="member-icon"><img src="images/users.png"></div></div><div class="name-right"><div class="top-item"><a class="popup" id="'+data.allUsers[i].user_login+'" href="#">'+data.allUsers[i].user_name+'</a></div><div class="bottom-item"><span class="status"></span></div></div><div class="clear-both"></div></div></li>';
				
			} else{ // for not loggedin memebers
				
				html+='<li class="users user-active"><div class="individuals"><div class="photo-left"><div class="member-icon"><img src="images/users.png"></div></div><div class="name-right"><div class="top-item"><a class="popup" id="'+data.allUsers[i].user_login+'" href="#">'+data.allUsers[i].user_name+'</a></div><div class="bottom-item"><span class="status">Available</span></div></div><div class="clear-both"></div></div></li>';
				
			}
			
		}
		
		$("#contactList").html(html);
		
	
	});
	



/******************************************************************************************************************
*  For common chat message
*/
	$("#message-form").submit(function(e){
		e.preventDefault();							
		if($("#typeMsg").val() != '' ){					
			socket.emit('send message', $("#typeMsg").val(),function(data){
				
				// add for error in callback return data
			
			});
			$("#typeMsg").val('');
		}
	});
	
	socket.on('new message',function(data){		
		$("#chatMsgs").append('<li><b>'+data.nick+'</b> : '+data.msg+"</li>");	
	});
	
/******
*  For common chat message ends
*******************************************************************************************************************/	
	
	
	
	socket.on('private new message',function(data,callback){  // New message arrives for receiver
		var classN = 'visible-chat'; 
		var uid = data.nick;
		console.log(data);
		
		
		
		
		if ( $('#'+data.nick+'-body').length ) {
			
			var msgList = '<li class="receiver"><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+data.msg+'</div><div class="datearea">'+data.dformat+'</div></div></div><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="clear-both"></div></li>';
			
			$("#message-body-"+uid).append(msgList);
			scrolltoTop();
			callback({status : true, activeUser : data.nick});
		}
		else if(data.isActive == 0){
		$.ajax({
				type: "POST",
				url: "/single_user",
				dataType: "json",
				data: { uid: data.nick ,clientUser: data.receiver,ack:1},
				success: function(retData) {
					
					
					var msgList = '<li class="receiver"><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+data.msg+'</div><div class="datearea">'+data.dformat+'</div></div></div><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="clear-both"></div></li>';
					
					
					
					var messages = '';
					for(var i=retData.chat.length-1;  i >= 0;  i--){
					
						//console.log(data.chat[i]);
						
						if(parseInt(retData.chat[i].sender_id) == parseInt(clientUserID) ){
							
							messages+='<li class="sender"><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+retData.chat[i].message+'</div><div class="datearea">'+retData.chat[i].created+'</div></div></div><div class="clear-both"></div></li>';
								
						} else{
						
							messages+='<li class="receiver"><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+retData.chat[i].message+'</div><div class="datearea">'+retData.chat[i].created+'</div></div></div><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="clear-both"></div></li>';
						}

					}
					
					
					
					
		chatHtml='<div id="'+uid+'-body" class="'+classN+'"><div class="chat-header"><div class="photo-left"><div class="user-icon"><img src="images/large-user.png"></div><div class="top"></div><div class="bottom"></div></div><div class="name-right"><div class="top"><span class="username">'+data.name+'</span></div><div class="bottom"><span class="status">Available</span></div></div><div class="clear-both"></div></div><div class="message-container"><div class="message-body"><ul id="message-body-'+uid+'">'+messages+'</ul><div id="message-foot-'+uid+'"></div></div><div class="message-form"><div class="save-container"><form name="message-form" id="message-form-'+uid+'" method="post" action="#" onsubmit="return Sub(this,\''+data.rid+'\',\''+data.name+'\' ,\''+data.id+'\'  );" ><input type="hidden" name="userID" class="userID" value="'+uid+'" /><input name="typeMsg" type="text" class="typeMsg"><input type="submit" value="Send" id="submit" class="btn btn-send"></form><div class="clear-both"></div></div></div></div>';
						
						
						$("#chatmsg-contain").html(chatHtml);	
						$("#message-body-"+uid).append(msgList);
						callback({status : true, activeUser : data.receiver});
					
					
					scrolltoTop();
		
				},
				error: function(jqXHR, textStatus, err) {
					console.log('text status '+textStatus+', err '+err);							
				}
		});
		
		
		}else{
		
			$("#"+data.nick).parent().addClass("notify");
			
		}
		
		
	
	});
	
	
	

	
	
	$(document).delegate('.popup', 'click', function(event) {  // When a user is clicked from client side for chat for first time
		
			var uid = $(this).attr('id'); // Get receiver username ie, clicked user
			var classN = 'visible-chat'; 
			
			$(this).parent().removeClass("notify");
			$.ajax({ // For picking old messages
							
							type	 : "POST",
							url		 : "/single_user",
							dataType : "json",
							data	 : { 
										uid			: uid ,       // UID => Receiver username
										clientUser	: clientUser, //clientUser => Sender username
										ack			: 0
										
								 	   },     
							success: function(data) {								


								var messages = '';
								for(var i=data.chat.length-1;  i >= 0;  i--){
									console.log(data.chat[i]);
									if(parseInt(data.chat[i].sender_id) == parseInt(clientUserID) ){
										
										messages+='<li class="sender"><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+data.chat[i].message+'</div><div class="datearea">'+data.chat[i].created+'</div></div></div><div class="clear-both"></div></li>';
											
									} else{
									
										messages+='<li class="receiver"><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+data.chat[i].message+'</div><div class="datearea">'+data.chat[i].created+'</div></div></div><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="clear-both"></div></li>';
									}

								}
								
		
								
								chatHtml='<div id="'+uid+'-body" class="'+classN+'"><div class="chat-header"><div class="photo-left"><div class="user-icon"><img src="images/large-user.png"></div><div class="top"></div><div class="bottom"></div></div><div class="name-right"><div class="top"><span class="username">'+data.receiver.user_name+'</span></div><div class="bottom"><span class="status">Available</span></div></div><div class="clear-both"></div></div><div class="message-container"><div class="message-body"><ul id="message-body-'+uid+'">'+messages+'</ul><div id="message-foot-'+uid+'"></div></div><div class="message-form"><div class="save-container"><form name="message-form" id="message-form-'+uid+'" method="post" action="#" onsubmit="return Sub(this,\''+data.members.sender.id+'\',\''+data.members.sender.user_name+'\',\''+data.receiver.id+'\');" ><input type="hidden" name="userID" class="userID" value="'+uid+'" /><input name="typeMsg" type="text" class="typeMsg"><input type="submit" value="Send" id="submit" class="btn btn-send"></form><div class="clear-both"></div></div></div></div>';
			
								$("#chatmsg-contain").html(chatHtml);
								scrolltoTop();
															
								
							},
							error: function(jqXHR, textStatus, err) {
								console.log('text status '+textStatus+', err '+err);							
							}
					});
			
	});
	
	
	

	
	

});   // document ready ends here






function Sub(obj,id, name,rid){  // Submit message from client side
	
	var mssg = obj.getElementsByClassName("typeMsg")[0].value;
	var user = obj.getElementsByClassName("userID")[0].value;
	
	var dateObj = new Date();
	
	var dformat = [dateObj.getFullYear() ,dateObj.getMonth()+1,
		dateObj.getDate()
		].join('-')+' '+
		[dateObj.getHours(),
		dateObj.getMinutes(),
		dateObj.getSeconds()].join(':');
	
	
	jQuery("#message-body-"+user).append('<li class="sender"><div class="icons col-lg-2 col-md-2 col-sm-2 col-xs-3"><div class="img-icon"><img src="images/users.png"></div></div><div class="mssg-text col-lg-10 col-md-10 col-sm-10 col-xs-9"><div class="text-contain"><div class="textarea">'+mssg+'</div><div class="datearea">'+dformat+'</div></div></div><div class="clear-both"></div></li>');
 	
	scrolltoTop();
	obj.getElementsByClassName("typeMsg")[0].value = ''; 
	
	
	if(mssg != ''){
		
		
		
		socket.emit('private message', { 
											mssg 		:  mssg, 
											user 		:  user, 
											sendID 		:  id, 
											name 		:  name, 
											receiveID  	:  rid,
											dformat		:  dformat
										}, 
										function(data){ // callback from server after receiving emitted message
			
															//console.log(data);
															//setTimeout(function(){
															$.ajax({
																	type	: "POST",
																	url		: "/save_single_chat",
																	dataType: "json",
																	data	: { 
																				sender_id	: data.senderID.trim() ,
																				receiver_id	: data.receiveID.trim(),
																				message 	: data.message.trim()
																			  },
																	success: function(data) {
																		
																	},
																	error: function(jqXHR, textStatus, err) {
																				console.log('text status '+textStatus+', err '+err);							
																			}
																	});
															//}, 500);
															
									
										}
						);
		
		
		
		
	}	
	return false;
	
}








function scrolltoTop(){
	
	var height = 0;
	$('.message-body li').each(function(i, value){
		height += parseInt($(this).innerHeight() + 30);
	});	
	height+='';
	$('.message-body').animate({scrollTop: height}, 2000);	
	
}