console.log("Loading Lambda Function")

exports.handler = function(event, context, callback) {

   //provide custom implementation here
   console.log("ADDED UPDATE TO CHECK IF Changes upload");
   console.log("ADDED UPDATE TO CHECK IF Changes upload");
   console.log("ADDED UPDATE TO CHECK IF Changes upload");
   
   //sample response structure	
   var response = {};
	response.statusCode = 200
	response.body = "Successful Response";
   
   callback(null, response);

}