var ccHqLat = 6.504361303523183;
var ccHqLon = 3.377968752756715;
var maximumRadius = 0.2;
var userId = '';
var db;
var mglConfig = {
        apiKey: 'y9UooIRpAGUiYJ_bARXWW0BcZ7vqvzVO',
        database: 'ccloc',
        visitsCollection: 'visits',
        loginsCollection: 'logins',
        collectionUrl: '',
        loginsUrl: '',
        baseUrl: 'https://api.mongolab.com/api/1/databases/'
};





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

                mglConfig.collectionUrl = mglConfig.baseUrl + mglConfig.database + '/collections/' + mglConfig.visitsCollection + '?apiKey=' + mglConfig.apiKey;
                mglConfig.loginsUrl = mglConfig.baseUrl + mglConfig.database + '/collections/' + mglConfig.loginsCollection + '?apiKey=' + mglConfig.apiKey;

                $("#regForm").submit(function (e) {
                      e.preventDefault();
                        doRegistration();
                });
                
                initializeDatabase();


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
function getGpsLocation() {

        var geoOptions = {
                maximumAge: 2000,
                enableHighAccuracy: true,
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);

}

var onSuccess = function(position) {
        var coordinatesInfo = 'Latitude: ' + position.coords.latitude + '<br />' +
                'Longitude: ' + position.coords.longitude + '<br />' +
                'Altitude: ' + position.coords.altitude + '<br />' +
                'Accuracy: ' + position.coords.accuracy + '<br />' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
                'Heading: ' + position.coords.heading + '<br />' +
                'Speed: ' + position.coords.speed + '<br />' +
                'Timestamp: ' + position.timestamp + '<br />';
        $('#deviceready').html(coordinatesInfo);
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        $('#deviceready').append('<br />Checking Distance to Hub');
        if (isWithinTheHubRange(userLat, userLon)) {//send to server
                $('#deviceready').append('<br />Within Hub Area');
                position.coords.timestamp = new Date().getTime();
                position.coords.userid = userId;
                $('#deviceready').append('<br />Sending to Server');
                $.ajax({
                        cache: false,
                        url: mglConfig.collectionUrl,
                        data: JSON.stringify(position),
                        type: "POST",
                        contentType: "application/json",
                        success: function(data) {
                                console.log(data);
                                $('#deviceready').append('<br />Sent to Server Successfully');
                        },
                }
                );
        } else {
                //terminate
                console.log("This user is not within the range");
                $('#deviceready').append('<br />This user is not within the hub area');
        }
        
        $('#loading').hide();
};



// onError Callback receives a PositionError object
//
function onError(error) {
        alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
}


/**
 * This guy checks if user is within the approved radius 
 * @returns boolean
 */

function isWithinTheHubRange(userLat, userLon) {

        if (getDistance(userLat, userLon, ccHqLat, ccHqLon) <= maximumRadius) {
                return true;
        }

        return false;


}




function initializeDatabase() {

        db = window.openDatabase("ccloc", "1.0", "cCloc Database", 200000);
        db.transaction(populateDB, errorCB, successCB);
}

// Populate the database
//
function populateDB(tx) {
        tx.executeSql('DROP TABLE IF  EXISTS login');
        tx.executeSql('CREATE TABLE IF NOT EXISTS login (id unique,userid,name,email)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS checkins (id unique,ctime,clat,clon,caccuracy)');
        checkUserRegistration(tx);
}


function checkUserRegistration(tx) {

        tx.executeSql('SELECT * FROM login LIMIT 1', [], userIsRegistered, errorCB);



}
function userIsRegistered(tx, results) {
        console.log("Returned rows = " + results.rows.length);
        // this will be true since it was a select statement and so rowsAffected was 0
        if (results.rows.length == 0) {
                console.log('User is NOT registered. Redirect to registration form');

                $('#deviceready').html("");
                $('#registrationArea').show();
                return false;
        } else {


                console.log("User is registered. Get GPS location");

                console.log(" ID = " + results.rows.item(0).userid);
                userId = results.rows.item(0).userid;

                getGpsLocation();

        }

}
function querySuccess(tx, results) {
        console.log("Returned rows = " + results.rows.length);
        // this will be true since it was a select statement and so rowsAffected was 0
        if (!results.rowsAffected) {
                console.log('No rows affected!');
                return false;
        }
        // for an insert statement, this property will return the ID of the last inserted row
        console.log("Last inserted row ID = " + results.insertId);
}

// Transaction error callback
//
function errorCB(tx, err) {
        alert("Error processing SQL: " + err);
}

// Transaction success callback
//
function successCB() {
        console.log("success!");
}

function doRegistration() {
        try {
                var personName = $('#name').val();
                var personEmail = $('#email').val();
                var personPhone = $('#phone').val();

//            if(!personName || !personEmail ||!personPhone){
//                    
//                    
//            }

                var userDataObj = {
                        name: personName,
                        email: personEmail,
                        phone: personPhone
                }
                $('#loading').show();
                $('#registrationArea').hide();
                console.log("Ready to make call");
                $.ajax({
                        cache: false,
                        url: mglConfig.loginsUrl,
                        data: JSON.stringify(userDataObj),
                        type: "POST",
                        contentType: "application/json",
                        success: function(data) {
                                console.log(data);
                                userId = data._id.$oid;

                                db.transaction(function(tx) {

                                        tx.executeSql("INSERT INTO login(userid,name,email) VALUES( '" + userId + "','" + personName + "','" + personEmail + "')");

                                }, errorCB, getGpsLocation);

                        },
                }
                );
        } catch (e) {
                alert(e.message);
                $('#registrationArea').show();
                $('#loading').hide();
        }

//            db.transaction(function(tx){
//                    //id unique,userid,name,email)
//                    tx.executeSql("INSERT INTO login(name");
//            }, errorCB, successCB);
//            
        return;
}