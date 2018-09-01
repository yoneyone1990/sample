/**
 * Created with JetBrains PhpStorm.
 * User: Quoc Vu
 * Date: 9/17/13
 * Time: 1:59 PM
 * To change this template use File | Settings | File Templates.
 */
var $ = jQuery.noConflict();

detectBlockFB("https://www.facebook.com",function(found){
    if(found) {
        // v2
        window.fbAsyncInit = function() {
            FB.init({
                appId      : '540185826438139',
                //appId      : '1415991485162032',
                //appId      : '533440620098716',
                xfbml      : true,
                version    : 'v3.1'
            });

            FB.Event.subscribe("send_to_messenger", function(e) {
                if (e.event == 'clicked') {
                    ga("send", "event", "journey_popup", "click", "click_get_started");
                    document.getElementById("popup-inside").innerHTML = "<img class='journey-kalay-logo' src='/wp-content/plugins/ringier-v1/app/Views/_assets/images/kalay-logo.png' /><p class='inform-txt'>Facebook Messgner ထဲသို႔ ေပးပို႔ျပီးပါျပီ</p>";
                    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        window.open("https://facebook.com/messages/t/kalay.com.mm", "_blank")
                    }
                }
            });
            FB.AppEvents.logPageView();
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

    }
    else {
        console.log("FB blocked");
    }
});


function detectBlockFB(url,callback) {
    // try to load favicon
    var timer = setTimeout(function(){
        // timeout after 5 seconds
        callback(false);
    },3000)

    var img = document.createElement("img");
    img.onload = function() {
        clearTimeout(timer);
        callback(true);
    }

    img.onerror = function() {
        clearTimeout(timer);
        callback(false);
    }

    img.src = url+"/favicon.ico";

}

var obj_overlay;
var obj_loading;

function login_fb(){
    //obj_overlay.unbind("click");
    obj_overlay = $("<div></div>");
    var height = $('body').height();
    obj_overlay.css({
        "position" : "fixed",
        "top" : 0,
        "left": 0,
        "z-index" : 1100,
        "background-color" : "rgb(119, 119, 119)",
        "opacity" : "0.7",
        "cursor" : "pointer",
        "width" : "100%",
        "height" : "100%"
    });
    $('body').append(obj_overlay);

    obj_loading = $("<div><img src='/wp-content/plugins/ringier-social/facebook/images/fancybox_loading.gif' width='22px' height='22px'/></div>");
    obj_loading.css({
        "position" : "fixed",
        "top" : "50%",
        "left" : "50%",
        "margin-top" : "-22px",
        "margin-left" : "-22px",
        "cursor" : "pointer",
        "overflow" : "hidden",
        "z-index" : 1104,
        "background-image" : "url('/wp-content/plugins/ringier-social/facebook/images/fancybox_sprite.png')",
        "background-position" : "0 -108px",
        "padding" : "10px 11px"
    });
    $('body').append(obj_loading);

    $('html').css({'cursor':'wait'});

    if (typeof(FB) !== 'undefined' && FB !== null ) {
        FB.login(function (response) {
            var access_token;
            if (response.authResponse) {
                FB.api('/me?fields=name,email', function (response) {
                    access_token = FB.getAuthResponse()['accessToken'];
                    response.access_token = access_token;
                    insertUserFB(response);
                });
            } else {
                obj_overlay.remove();
                obj_loading.remove();
                $('html').css({'cursor': 'default'});
            }
        }, {scope: 'email'});
    }
//    obj_overlay.remove();
//    obj_loading.remove();
}

function insertUserFB(data){
    data.action = "ringier_facebook_login";
    var url = new URL(window.location.href);
    var msgId = url.searchParams.get('messenger_user_id');
    var utm_campaign = url.searchParams.get('utm_campaign');
    data.msgId = msgId;
    data.utm_campaign = utm_campaign;
    $.ajax({
        url : ringier_social.admin_ajax_url,
        data : data,
        type : "post",
        dataType : 'json',
        success : function(response){
            if( response.error === 0 ){
                ga_tracking.sign_in_fb();
                // if( response.link == undefined ){
                    if(msgId && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
                      window.location.href = 'https://facebook.com/messages/t/kalay.com.mm';
				    else if(msgId) 
					  window.location.href = 'https://kalay.com.mm';
                    else
                      window.location.href = window.location.href;
                // }else{
                //     window.location = 'https://www.kalay.com.mm/account/profile/?edit-profile';
                // }

            }else{
                obj_overlay.remove();
                obj_loading.remove();
                alert("Login failed.");
            }
        }
    });
}