/* promise example 
var promise = new Promise(function(resolve, reject) {
    // do a thing, possibly async, then
    if( everything turned out fine )
    resolve('stuf worked!');
    else 
    reject(Error('it broke'));
});
*/
function get(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
            if(req.status == 200) {
                // Resolve the Promise with a response text
                resolve(req.response);
            }
            else {
                // Otherwise reject with a status text
                reject(Error(req.statusText));
            }
        }; // end onload
        
        // Handle network errors 
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make a request
        req.send();
        
    }); // end Promise
}; // end all