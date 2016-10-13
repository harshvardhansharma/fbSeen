var baseURL = "https://www.facebook.com";
var list;

var runEveryXSeconds = 5 * 1000;

var timer = setInterval(function(){
	execute();
}, runEveryXSeconds);

function execute(){
	getFbSeenEnabled(function(enabled){
		if(enabled == true){
			chrome.storage.local.get("images", function(items){
		    	if(!chrome.runtime.error){
		    		list = items.images;
		    		process();
		    	}
			});
		}
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.text && (msg.text == 'disable')) {
        resetCurrentPage();
    }

    if (msg.text && (msg.text == 'enable')) {
        execute();
    }
});

function getFbSeenEnabled(callback){
	chrome.storage.local.get("fbSeenEnabled", function(items){
		debugger
		if(!chrome.runtime.error){
			//debugger
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

function alreadyViewed(url, callback){
	if(!url.startsWith("https://www.facebook.com")){
		url = baseURL + url;
	}
	url = stripQueryStringAndHashFromPath(url);

	if(list[url.hashCode()]){
		callback(true);
	}
	else{
		callback(false);
	}
}

function resetCurrentPage(){
	$(".userContentWrapper").each(function(){
		$(this).css("opacity", "1.0");
	});
}

function process(){
	$(".userContentWrapper").each(function(){
		var curr = $(this);
		$(this).find("._4-eo").each(function(){
			var href = $(this).attr("href");
			alreadyViewed(href, function(res){
				if(res === true){
					$(curr).css("opacity", "0.2");
				}
			});
		});
	});
}

function stripQueryStringAndHashFromPath(url) {
	return url.split("#")[0];
}

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