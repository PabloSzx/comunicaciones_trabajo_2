import{prompt as n}from"inquirer";import o from"node-wifi";n([{type:"input",name:"first_name",message:"What's your first name"}]).then(function(n){console.log("answers: ",n),o.init({iface:null}),o.scan(function(n,o){n?console.log(n):console.log(o)})});
//# sourceMappingURL=index.mjs.map
