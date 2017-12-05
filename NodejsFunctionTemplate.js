console.log("Loading Lambda Function")

exports.handler = function(event, context, callback) {

   //provide custom implementation here
 
   //sample response structure	
   var response = {};
	response.statusCode = 200
	response.body = "Successful Response";
   
   callback(null, response);

}