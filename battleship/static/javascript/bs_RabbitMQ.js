let amqp = require('amqplib');

let sockjs = new SockJS('http://192.168.1.100:15674/stomp'),
let client = webstomp.over(sockjs, {heartbeat: false, debug: true});

let connect = amqp
/*
let bs_mg = function (bs_mq) { 
	let config = {
            corr         : generateUuid(),
            hdr_login    : 'test',
            hdr_passcode : 'test'
        };


        sockjs.addEventListener('message', function(e){

                for (var key in e) {
                      if (e.hasOwnProperty(key)) {
                        var val = e[key];
                        //console.log(key + ': ' + val);
                        console.log('typeof %s: %s', val, typeof val);

                        if(typeof e[key] == "object"){
                              console.log('thing: %s', JSON.stringify(e[key]));
                        }
                      }
                }

            console.log('e: %s', JSON.stringify(e.data));
            console.log('\te_data_corr: %s\n\tcorr: %s', e.data.correlationId, corr);

            if(e.data.correlationId == corr) {
                console.log(' [.] Got %s', JSON.stringify(e));
                //setTimeout(function() {conn.close()}, 500);
            }
        });

        let header={user: config.hdr_login,
                    pass: config.hdr_passcode};
        client.connect(user: 'test', pass: 'test',
            function(msg){
                client.subscribe('/queue/register.elsporko', function(msg){
                    }, {noAck: true});

            var enc = new TextEncoder('utf8');
            var param = enc.encode('elsporko');
            console.log('passing %s', param);

            client.send('/queue/register',
                enc.encode("elsporko"),
                {'correlationId': config.corr,
                 'reply-to': '/temp-queue/register.elsporko'
                }
            );

            },

            function(error){
                console.log('Error connecting to WS via stomp:'+JSON.stringify(error));
            }
        );
            
}
*/

	module.exports = {
	}
