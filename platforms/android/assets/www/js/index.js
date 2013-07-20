var ccHqLat = 6.504361303523183;
var ccHqLon = 3.377968752756715;
var maximumRadius = 0.2;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
         getGpsLocation();
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


function getDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = (lat2 - lat1).toRad();
        var dLon = (lon2 - lon1).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; //in kilometres
}
// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRad == 'undefined') {
        Number.prototype.toRad = function() {
                return this * Math.PI / 180;
        }
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg == 'undefined') {
        Number.prototype.toDeg = function() {
                return this * 180 / Math.PI;
        }
}

/** 
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 * 
 * @param   {Number} precision: Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
        Number.prototype.toPrecisionFixed = function(precision) {

                // use standard toPrecision method
                var n = this.toPrecision(precision);

                // ... but replace +ve exponential format with trailing zeros
                n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
                        sig = sig.replace(/\./, '');       // remove decimal from significand
                        l = sig.length - 1;
                        while (exp-- > l)
                                sig = sig + '0'; // append zeros from exponent
                        return sig;
                });

                // ... and replace -ve exponential format with leading zeros
                n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
                        sig = sig.replace(/\./, '');       // remove decimal from significand
                        while (exp-- > 1)
                                sig = '0' + sig; // prepend zeros from exponent
                        return '0.' + sig;
                });

                return n;
        }
}

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
        String.prototype.trim = function() {
                return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
}


/*
* This retrieves the users current coordinates
 */
function getGpsLocation(){
    
    var geoOptions = {
            maximumAge: 2000,
            enableHighAccuracy: true,        
    }
    
    navigator.geolocation.getCurrentPosition(onSuccess, onError,geoOptions);
    
}

var onSuccess = function(position) {
    alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
  
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
  device.exitApp();

  if(isWithinTheHubRange(userLat,userLon)){//send to server
          
          
          
  }else{
          //terminate
  }
  
};



// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


/**
 * This guy checks if user is within the approved radius 
 * @returns boolean
 */

function isWithinTheHubRange(userLat,userLon){
        
        if(getDistance(userLat,userLon,ccHqLat,ccHqLon) <= maximumRadius){
                return true;       
        }
        
        return false;
        
        
}


