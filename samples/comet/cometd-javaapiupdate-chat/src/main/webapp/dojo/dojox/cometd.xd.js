/*
	Copyright (c) 2004-2007, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/book/dojo-book-0-9/introduction/licensing
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

dojo._xdResourceLoaded({depends:[["provide","dojo.AdapterRegistry"],["provide","dojo.io.script"],["provide","dojox._cometd.cometd"],["provide","dojox.cometd"]],defineResource:function(_1){if(!_1._hasResource["dojo.AdapterRegistry"]){_1._hasResource["dojo.AdapterRegistry"]=true;_1.provide("dojo.AdapterRegistry");_1.AdapterRegistry=function(_2){this.pairs=[];this.returnWrappers=_2||false;};_1.extend(_1.AdapterRegistry,{register:function(_3,_4,_5,_6,_7){this.pairs[((_7)?"unshift":"push")]([_3,_4,_5,_6]);},match:function(){for(var i=0;i<this.pairs.length;i++){var _9=this.pairs[i];if(_9[1].apply(this,arguments)){if((_9[3])||(this.returnWrappers)){return _9[2];}else{return _9[2].apply(this,arguments);}}}throw new Error("No match found");},unregister:function(_a){for(var i=0;i<this.pairs.length;i++){var _c=this.pairs[i];if(_c[0]==_a){this.pairs.splice(i,1);return true;}}return false;}});}if(!_1._hasResource["dojo.io.script"]){_1._hasResource["dojo.io.script"]=true;_1.provide("dojo.io.script");_1.io.script={get:function(_d){var _e=this._makeScriptDeferred(_d);var _f=_e.ioArgs;_1._ioAddQueryToUrl(_f);this.attach(_f.id,_f.url);_1._ioWatch(_e,this._validCheck,this._ioCheck,this._resHandle);return _e;},attach:function(id,url){var _12=_1.doc.createElement("script");_12.type="text/javascript";_12.src=url;_12.id=id;_1.doc.getElementsByTagName("head")[0].appendChild(_12);},remove:function(id){_1._destroyElement(_1.byId(id));if(this["jsonp_"+id]){delete this["jsonp_"+id];}},_makeScriptDeferred:function(_14){var dfd=_1._ioSetArgs(_14,this._deferredCancel,this._deferredOk,this._deferredError);var _16=dfd.ioArgs;_16.id="dojoIoScript"+(this._counter++);_16.canDelete=false;if(_14.callbackParamName){_16.query=_16.query||"";if(_16.query.length>0){_16.query+="&";}_16.query+=_14.callbackParamName+"=dojo.io.script.jsonp_"+_16.id+"._jsonpCallback";_16.canDelete=true;dfd._jsonpCallback=this._jsonpCallback;this["jsonp_"+_16.id]=dfd;}return dfd;},_deferredCancel:function(dfd){dfd.canceled=true;if(dfd.ioArgs.canDelete){_1.io.script._deadScripts.push(dfd.ioArgs.id);}},_deferredOk:function(dfd){if(dfd.ioArgs.canDelete){_1.io.script._deadScripts.push(dfd.ioArgs.id);}if(dfd.ioArgs.json){return dfd.ioArgs.json;}else{return dfd.ioArgs;}},_deferredError:function(_19,dfd){if(dfd.ioArgs.canDelete){if(_19.dojoType=="timeout"){_1.io.script.remove(dfd.ioArgs.id);}else{_1.io.script._deadScripts.push(dfd.ioArgs.id);}}console.debug("dojo.io.script error",_19);return _19;},_deadScripts:[],_counter:1,_validCheck:function(dfd){var _1c=_1.io.script;var _1d=_1c._deadScripts;if(_1d&&_1d.length>0){for(var i=0;i<_1d.length;i++){_1c.remove(_1d[i]);}_1.io.script._deadScripts=[];}return true;},_ioCheck:function(dfd){if(dfd.ioArgs.json){return true;}var _20=dfd.ioArgs.args.checkString;if(_20&&eval("typeof("+_20+") != 'undefined'")){return true;}return false;},_resHandle:function(dfd){if(_1.io.script._ioCheck(dfd)){dfd.callback(dfd);}else{dfd.errback(new Error("inconceivable dojo.io.script._resHandle error"));}},_jsonpCallback:function(_22){this.ioArgs.json=_22;}};}if(!_1._hasResource["dojox._cometd.cometd"]){_1._hasResource["dojox._cometd.cometd"]=true;_1.provide("dojox._cometd.cometd");dojox.cometd=new function(){this._initialized=false;this._connected=false;this._polling=false;this.connectionTypes=new _1.AdapterRegistry(true);this.version="1.0";this.minimumVersion="0.9";this.clientId=null;this.messageId=0;this.batch=0;this._isXD=false;this.handshakeReturn=null;this.currentTransport=null;this.url=null;this.lastMessage=null;this.topics={};this._messageQ=[];this.handleAs="json-comment-optional";this.advice;this.pendingSubscriptions={};this.pendingUnsubscriptions={};this._subscriptions=[];this.tunnelInit=function(_23,_24){};this.tunnelCollapse=function(){console.debug("tunnel collapsed!");};this.init=function(_25,_26,_27){_26=_26||{};_26.version=this.version;_26.minimumVersion=this.minimumVersion;_26.channel="/meta/handshake";_26.id=""+this.messageId++;this.url=_25||djConfig["cometdRoot"];if(!this.url){console.debug("no cometd root specified in djConfig and no root passed");return;}var _28="^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$";var r=(""+window.location).match(new RegExp(_28));if(r[4]){var tmp=r[4].split(":");var _2b=tmp[0];var _2c=tmp[1]||"80";r=this.url.match(new RegExp(_28));if(r[4]){tmp=r[4].split(":");var _2d=tmp[0];var _2e=tmp[1]||"80";this._isXD=((_2d!=_2b)||(_2e!=_2c));}}if(!this._isXD){if(_26.ext){if(_26.ext["json-comment-filtered"]!==true&&_26.ext["json-comment-filtered"]!==false){_26.ext["json-comment-filtered"]=true;}}else{_26.ext={"json-comment-filtered":true};}}var _2f={url:this.url,handleAs:this.handleAs,content:{"message":_1.toJson([_26])},load:_1.hitch(this,"finishInit"),error:function(e){console.debug("handshake error!:",e);}};if(_27){_1.mixin(_2f,_27);}this._props=_26;this._initialized=true;this.batch=0;this.startBatch();if(this._isXD){_2f.callbackParamName="jsonp";return _1.io.script.get(_2f);}return _1.xhrPost(_2f);};this.finishInit=function(_31){_31=_31[0];this.handshakeReturn=_31;if(_31["advice"]){this.advice=_31.advice;}if(!_31.successful){console.debug("cometd init failed");if(this.advice&&this.advice["reconnect"]=="none"){return;}if(this.advice&&this.advice["interval"]&&this.advice.interval>0){var _32=this;setTimeout(function(){_32.init(_32.url,_32._props);},this.advice.interval);}else{this.init(this.url,this._props);}return;}if(_31.version<this.minimumVersion){console.debug("cometd protocol version mismatch. We wanted",this.minimumVersion,"but got",_31.version);return;}this.currentTransport=this.connectionTypes.match(_31.supportedConnectionTypes,_31.version,this._isXD);this.currentTransport._cometd=this;this.currentTransport.version=_31.version;this.clientId=_31.clientId;this.tunnelInit=_1.hitch(this.currentTransport,"tunnelInit");this.tunnelCollapse=_1.hitch(this.currentTransport,"tunnelCollapse");this.currentTransport.startup(_31);};this.deliver=function(_33){_1.forEach(_33,this._deliver,this);return _33;};this._deliver=function(_34){if(!_34["channel"]){if(_34["success"]!==true){console.debug("cometd error: no channel for message!",_34);return;}}this.lastMessage=_34;if(_34.advice){this.advice=_34.advice;}if((_34["channel"])&&(_34.channel.length>5)&&(_34.channel.substr(0,5)=="/meta")){switch(_34.channel){case "/meta/connect":if(_34.successful&&!this._connected){this._connected=this._initialized;this.endBatch();}else{if(!this._initialized){this._connected=false;}}break;case "/meta/subscribe":var _35=this.pendingSubscriptions[_34.subscription];if(!_34.successful){if(_35){_35.errback(new Error(_34.error));delete this.pendingSubscriptions[_34.subscription];}return;}dojox.cometd.subscribed(_34.subscription,_34);if(_35){_35.callback(true);delete this.pendingSubscriptions[_34.subscription];}break;case "/meta/unsubscribe":var _35=this.pendingUnsubscriptions[_34.subscription];if(!_34.successful){if(_35){_35.errback(new Error(_34.error));delete this.pendingUnsubscriptions[_34.subscription];}return;}this.unsubscribed(_34.subscription,_34);if(_35){_35.callback(true);delete this.pendingUnsubscriptions[_34.subscription];}break;}}this.currentTransport.deliver(_34);if(_34.data){var _36="/cometd"+_34.channel;_1.publish(_36,[_34]);}};this.disconnect=function(){_1.forEach(this._subscriptions,_1.unsubscribe);this._subscriptions=[];this._messageQ=[];if(this._initialized&&this.currentTransport){this._initialized=false;this.currentTransport.disconnect();}this._initialized=false;if(!this._polling){this._connected=false;}};this.publish=function(_37,_38,_39){var _3a={data:_38,channel:_37};if(_39){_1.mixin(_3a,_39);}this._sendMessage(_3a);};this._sendMessage=function(_3b){if(this.currentTransport&&this._connected&&this.batch==0){return this.currentTransport.sendMessages([_3b]);}else{this._messageQ.push(_3b);}};this.subscribe=function(_3c,_3d,_3e){if(this.pendingSubscriptions[_3c]){var _3f=this.pendingSubscriptions[_3c];_3f.cancel();delete this.pendingSubscriptions[_3c];}var _40=new _1.Deferred();this.pendingSubscriptions[_3c]=_40;if(_3d){var _41="/cometd"+_3c;if(this.topics[_41]){_1.unsubscribe(this.topics[_41]);}var _42=_1.subscribe(_41,_3d,_3e);this.topics[_41]=_42;}this._sendMessage({channel:"/meta/subscribe",subscription:_3c});return _40;};this.subscribed=function(_43,_44){};this.unsubscribe=function(_45){if(this.pendingUnsubscriptions[_45]){var _46=this.pendingUnsubscriptions[_45];_46.cancel();delete this.pendingUnsubscriptions[_45];}var _47=new _1.Deferred();this.pendingUnsubscriptions[_45]=_47;var _48="/cometd"+_45;if(this.topics[_48]){_1.unsubscribe(this.topics[_48]);}this._sendMessage({channel:"/meta/unsubscribe",subscription:_45});return _47;};this.unsubscribed=function(_49,_4a){};this.startBatch=function(){this.batch++;};this.endBatch=function(){if(--this.batch<=0&&this.currentTransport&&this._connected){this.batch=0;var _4b=this._messageQ;this._messageQ=[];if(_4b.length>0){this.currentTransport.sendMessages(_4b);}}};this._onUnload=function(){_1.addOnUnload(dojox.cometd,"disconnect");};};dojox.cometd.longPollTransport=new function(){this._connectionType="long-polling";this._cometd=null;this.lastTimestamp=null;this.check=function(_4c,_4d,_4e){return ((!_4e)&&(_1.indexOf(_4c,"long-polling")>=0));};this.tunnelInit=function(){if(this._cometd._polling){return;}this.openTunnelWith({message:_1.toJson([{channel:"/meta/connect",clientId:this._cometd.clientId,connectionType:this._connectionType,id:""+this._cometd.messageId++}])});};this.tunnelCollapse=function(){if(!this._cometd._polling){this._cometd._polling=false;if(this._cometd["advice"]){if(this._cometd.advice["reconnect"]=="none"){return;}if((this._cometd.advice["interval"])&&(this._cometd.advice.interval>0)){var _4f=this;setTimeout(function(){_4f._connect();},this._cometd.advice.interval);}else{this._connect();}}else{this._connect();}}};this._connect=function(){if((this._cometd["advice"])&&(this._cometd.advice["reconnect"]=="handshake")){this._cometd.init(this._cometd.url,this._cometd._props);}else{if(this._cometd._connected){this.openTunnelWith({message:_1.toJson([{channel:"/meta/connect",connectionType:this._connectionType,clientId:this._cometd.clientId,timestamp:this.lastTimestamp,id:""+this._cometd.messageId++}])});}}};this.deliver=function(_50){if(_50["timestamp"]){this.lastTimestamp=_50.timestamp;}};this.openTunnelWith=function(_51,url){var d=_1.xhrPost({url:(url||this._cometd.url),content:_51,handleAs:this._cometd.handleAs,load:_1.hitch(this,function(_54){this._cometd._polling=false;this._cometd.deliver(_54);this.tunnelCollapse();}),error:function(err){console.debug("tunnel opening failed:",err);_1.cometd._polling=false;}});this._cometd._polling=true;};this.sendMessages=function(_56){for(var i=0;i<_56.length;i++){_56[i].clientId=this._cometd.clientId;_56[i].id=""+this._cometd.messageId++;}return _1.xhrPost({url:this._cometd.url||djConfig["cometdRoot"],handleAs:this._cometd.handleAs,load:_1.hitch(this._cometd,"deliver"),content:{message:_1.toJson(_56)}});};this.startup=function(_58){if(this._cometd._connected){return;}this.tunnelInit();};this.disconnect=function(){_1.xhrPost({url:this._cometd.url||djConfig["cometdRoot"],handleAs:this._cometd.handleAs,content:{message:_1.toJson([{channel:"/meta/disconnect",clientId:this._cometd.clientId,id:""+this._cometd.messageId++}])}});};};dojox.cometd.callbackPollTransport=new function(){this._connectionType="callback-polling";this._cometd=null;this.lastTimestamp=null;this.check=function(_59,_5a,_5b){return (_1.indexOf(_59,"callback-polling")>=0);};this.tunnelInit=function(){if(this._cometd._polling){return;}this.openTunnelWith({message:_1.toJson([{channel:"/meta/connect",clientId:this._cometd.clientId,connectionType:this._connectionType,id:""+this._cometd.messageId++}])});};this.tunnelCollapse=dojox.cometd.longPollTransport.tunnelCollapse;this._connect=dojox.cometd.longPollTransport._connect;this.deliver=dojox.cometd.longPollTransport.deliver;this.openTunnelWith=function(_5c,url){_1.io.script.get({load:_1.hitch(this,function(_5e){this._cometd._polling=false;this._cometd.deliver(_5e);this.tunnelCollapse();}),error:function(){this._cometd._polling=false;console.debug("tunnel opening failed");},url:(url||this._cometd.url),content:_5c,callbackParamName:"jsonp"});this._cometd._polling=true;};this.sendMessages=function(_5f){for(var i=0;i<_5f.length;i++){_5f[i].clientId=this._cometd.clientId;_5f[i].id=""+this._cometd.messageId++;}var _61={url:this._cometd.url||djConfig["cometdRoot"],load:_1.hitch(this._cometd,"deliver"),callbackParamName:"jsonp",content:{message:_1.toJson(_5f)}};return _1.io.script.get(_61);};this.startup=function(_62){if(this._cometd._connected){return;}this.tunnelInit();};this.disconnect=dojox.cometd.longPollTransport.disconnect;this.disconnect=function(){_1.io.script.get({url:this._cometd.url||djConfig["cometdRoot"],callbackParamName:"jsonp",content:{message:_1.toJson([{channel:"/meta/disconnect",clientId:this._cometd.clientId,id:""+this._cometd.messageId++}])}});};};dojox.cometd.connectionTypes.register("long-polling",dojox.cometd.longPollTransport.check,dojox.cometd.longPollTransport);dojox.cometd.connectionTypes.register("callback-polling",dojox.cometd.callbackPollTransport.check,dojox.cometd.callbackPollTransport);_1.addOnUnload(dojox.cometd,"_onUnload");}if(!_1._hasResource["dojox.cometd"]){_1._hasResource["dojox.cometd"]=true;_1.provide("dojox.cometd");}}});