
function getFbSeenEnabled(callback){
	chrome.storage.local.get("fbSeenEnabled", function(items){
		if(!chrome.runtime.error){
			if(items.fbSeenEnabled == true){
				callback(true);
			}
			else if(items.fbSeenEnabled == false){
				callback(false);
			}
			else{
				callback(true);
			}
		}
		else{
			callback(true);	
		}
	});
}

function setFbSeenEnabled(enabled){
	chrome.storage.local.set({ "fbSeenEnabled" : enabled });
}

chrome.browserAction.onClicked.addListener(function(tab){
	getFbSeenEnabled(function(enabled){
		if(enabled == true){
			chrome.browserAction.setTitle({title: "Enable fbSeen"});
			chrome.browserAction.setIcon({
			  path : {
			    "38": "icon_48_disable.png"
			  }
			});
			setFbSeenEnabled(false);
			chrome.tabs.sendMessage(tab.id, {text: 'disable'});
		}
		else{
			chrome.browserAction.setTitle({title: "Disable fbSeen"});
			chrome.browserAction.setIcon({
			  path : {
			    "38": "icon_48.png"
			  }
			});
			setFbSeenEnabled(true);	
			chrome.tabs.sendMessage(tab.id, {text: 'enable'});
		}
	});
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
	getFbSeenEnabled(function(enabled){
		if(enabled){
			if(!tab.url.startsWith("chrome:") && tab.url.startsWith("https://www.facebook.com/") && tab.url.indexOf("photo") > -1){
				addViewedImage(tab.url);
			}
		}
	});
});

function getImagePath(url){
	if(url.indexOf("photo") > -1){
		var domain = "https://www.facebook.com/";
		return url.substring(domain.length);
	}
	return null;
}

function addViewedImage(id){
	getViewedImages(function(list){
		if(typeof list === 'undefined'){
			list = new Object();
		}

		id = stripQueryStringAndHashFromPath(id);
		id = id.replace("&theater", "");
		list[id.hashCode()] = new Date().getTime();
		//chrome.storage.local.set({"images_added" : true});
		chrome.storage.local.set({ "images" : list });
	});	
}

function getViewedImages(callback){
	chrome.storage.local.get("images", function(items){
		if(!chrome.runtime.error){
			callback(items.images);
		}
	});
}

function stripQueryStringAndHashFromPath(url) {
  return url.split("#")[0];
}

// TO EVICT OLD DATA

// run every 30mins
var runEveryXMilli = 300000;

// evict after every 2hrs
var timeToAddInMilli = 7200000;

var timer = setInterval(function(){
	chrome.storage.local.get("images", function(items){
    	if(!chrome.runtime.error){
    		var list = items.images;
    		for(var i in list){
    			if(list[i] + timeToAddInMilli < new Date().getTime()){
    				delete list[i];
    			}
    		}

    		chrome.storage.local.set({ "images" : list });
    	}
	});
}, runEveryXMilli);

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};