var e,n=require("inquirer"),o=(e=require("node-wifi"))&&"object"==typeof e&&"default"in e?e.default:e;n.prompt([{type:"input",name:"first_name",message:"What's your first name"}]).then(function(e){console.log("answers: ",e),o.init({iface:null}),o.scan(function(e,n){e?console.log(e):console.log(n)})});
//# sourceMappingURL=index.js.map
