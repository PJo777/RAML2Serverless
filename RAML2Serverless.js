var raml = require('raml-1-parser');
var YAML = require('json2yaml')
var fs = require("fs");
var path = require("path");

//global variable -  parameters later.
var _runtime = "nodejs6.10";
var _codebase = "src";
var _runtimeExt = "js";


var args = process.argv.slice(2);
var raml_file = args[0];
// Here we create a file name to be loaded
var fName = path.resolve(__dirname, raml_file);
// Parse our RAML file with all the dependencies
var ast = raml.loadSync(fName);

var data = ast.specification;
var apiResources = data.resources;

var funcs = [];

// Enumerate all the resources and get a list of Functions 

Object.keys(apiResources).forEach(function(key){
    processResource(apiResources[key])
})

//create CFT Object from Function Definitions (based on runtime)
var CFT = getCloudFormationTemplate(funcs, _runtime , _runtimeExt);

// Convert the CFT object to YAML format.
var  ymlText = YAML.stringify(CFT);

// CFT File Name 
createCFTFile(ymlText);

// Create source code files based on template.
createSourceTemplateFiles(funcs, _runtime);

console.log("Processing Complete !");

//all the functions.

function createSourceTemplateFiles(funcs, _runtime ) {

    var dir = './output/src';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
  //TODO check runtime and use appropriate base template
  for (var i in funcs) {
    var funcRes = funcs[i];
    var codeFile = _codebase + "/" + funcRes.name + "Function."  + _runtimeExt;
    fs.createReadStream("NodejsFunctionTemplate.js").pipe(fs.createWriteStream("./output/" + codeFile));
  }
}

function createCFTFile(ymlText) {

    var YAMLtxt = ymlText.replace(/(---)/g, '').replace(/( - )/g, '');
     //YAMLtxt = ymlText;
    
    var dir = './output';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    var raml_file_name = raml_file.substring(raml_file.lastIndexOf('/'));
    var cft_file = raml_file_name.substring(0, raml_file_name.lastIndexOf('.')) + ".cft";
    fs.writeFile("./output/" + cft_file, YAMLtxt, function(err) {
        if(err) {
            return console.log(err);
        }
     
    });
}

function processResource(res) {

    // Trace resource's relative URI
    var relativeUri = res.relativeUri;
    // Next method returns full relative URI (which is equal with previous one
    // for top-level resources, but for subresources it returns full path from the
    // resources base URL)
    var completeRelativeUri = res.completeRelativeUri;

    //process methods (if found, add it to our functions collection)
    if (res.methods) {
       Object.keys(res.methods).forEach(function(key){
        var method = res.methods[key];

        var funcDef = {};
        funcDef.name = getFuncName(completeRelativeUri,method.method );
        funcDef.path = completeRelativeUri
        funcDef.method = method.method

        funcs.push(funcDef);
       })   
    }

    // Let's enumerate all URI parameters - this is not used for now
    if (res.uriParameters) {

        Object.keys(res.uriParameters).forEach(function(key){
            var uriParam = res.uriParameters[key];
            // Here we trace URI parameter's name and types
            //console.log("\tURI Parameter:", uriParam.name, uriParam.type.join(","));
        })
    }

    // Recursive call this function for all subresources
    if (res.resources) {
        Object.keys(res.resources).forEach(function(key){
            var subRes = res.resources[key];
            processResource(subRes);
        })
    }
}

function getFuncName (completeUri, methodName) {

  //replace all query string parameters enclosing braces with ''
  var t = completeUri.replace(/[{}]/g, '');

  if (methodName) {
    t = t + "/" + methodName;
  }
  
  var name = '';

  var ts = t.split('/')
  for (var i in ts) {  
    var t2 = ts[i];
    if (t2.length > 0 ) {
        //Title-Case each Part of the URI
        name = name + t2.charAt(0).toUpperCase() + t2.substr(1).toLowerCase();
    }
  }

  return name;
}

function getCloudFormationTemplate(functions, runtime, runtimeExt) {
    //Create an object for CloudFormation Template for all the Functions
var CFT = {};
CFT.AWSTemplateFormatVersion = '2010-09-09';
CFT.Transform = 'AWS::Serverless-2016-10-31';
CFT.Resources = [];

    //process all resources
    for (var i in functions) {

         var funcRes = functions[i];
         
         var func = {};
        //func.name = funcRes.name;
         func.Type = "AWS::Serverless::Function";
         func.Properties = {};
         func.Properties.Handler = funcRes.name + "Function.handler";
         func.Properties.Runtime = runtime;
         func.Properties.CodeUri = _codebase + "/" + funcRes.name + "Function."  + runtimeExt;
         func.Properties.Events = {};
         Evt = {};
         //Evt.name  = funcRes.name + "Resource";
         Evt.Type = "Api";
         Evt.Properties = {};
         Evt.Properties.Path = funcRes.path;
         Evt.Properties.Method = funcRes.method;

         func.Properties.Events[funcRes.name + "Resource"] = Evt;
         
         var objF = {};
         objF[funcRes.name + "Function"] = func;
         CFT.Resources.push(objF);
    }

    return CFT;
}
