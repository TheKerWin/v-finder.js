// MIT License
//
// Copyright (c) 2019 Kerwin David Mercado
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
const acorn = require('acorn');							//ast parser / bulder
var fs = require('fs');
var path = require('path');
const methodFinder = require("./signatures.js").mf;
const injections = require("./signatures.js").inj;
const packageData = require("./signatures.js").pkg;
const types = require("./signatures.js").typ;

var buildLinkedASTFromFile = function(filePath) { // builds and returns an AST
	let source = fs.readFileSync(filePath).toString('utf-8');
	let ast = acorn.parse(source, {ecmaVersion: 6, locations: true, allowHashBang: true, allowImportExportEverywhere: true,}); //sourceType: 'module',});
	return ast;
};

const filterRequire = function(moduleName, arr){ //checks that the require is to the correct module
	result = [];
	for (var k = 0; k < arr.length; k++) {
		const found = methodFinder(arr[k].scope, arr[k].type, 'require', arr[k].receiver.name, arr[k].path);
		for (var i = 0; i < found.length; i++) {
			if (found.length === 0) {
			}else if(found[i].args[0].value === moduleName){
				result.push(packageData(found[i].receiver, found[i].args, found[i].scope, arr[k]));
			};
		}
	}
	return result;
};

const filter = function(method, arr, mod_name){//filters the list to find if the method is called
	res = [];
	for (var k = 0; k < arr.length; k++) {
		const found = methodFinder(arr[k].scope, arr[k].type, method, arr[k].receiver.name, null, arr[k].path);
		for (var i = 0; i < found.length; i++) {
			if (found.length === 0) {
			}else if(found[i].receiver.type === 'Identifier'){
				res.push(packageData(found[i].receiver, found[i].args, found[i].scope, arr[k], 'v', arr[k].path));
			}else if (found[i].receiver.type === 'CallExpression') {
				res.push(packageData(found[i].receiver.callee, found[i].args, found[i].scope, arr[k], 'm', arr[k].path));
			}else if (found[i].receiver.type === 'MemberExpression') {
				res.push(packageData({name: [found[i].receiver.object.name, found[i].receiver.property.name], loc: found[i].receiver.loc}, found[i].args, found[i].scope, arr[k], 'r', arr[k].path));
			}else if (found[i].receiver.type === 'SequenceExpression') {
				res.push(packageData(found[i].receiver, found[i].args, found[i].scope, arr[k], 'v', arr[k].path));
			}
		}
	}
	return res;
};

const verifyArgs = function(e_list){//checks the args' types
	let list = [];
	for (var z = 0; z < e_list.length; z++) {
		while (e_list[z].previous.previous !== null){
			e_list[z] = e_list[z].previous;
		}
		list.push(e_list[z]);
	}
	let result = [];
	for (var i = 0; i < list.length; i++) {
			switch (list[i].args[0].type) {
				case 'Literal': //do nothing
					break;
				case 'Identifier':
					const found = methodFinder(list[i].scope, 'a', null, list[i].args[0].name);
					if (found[0].type !== 'Literal') {
						if(!result.includes(list[i])){
							result.push(list[i]);
						}
					}
					break;//Search for variable and check definition
				case 'BinaryExpression':
					if (list[i].args[0].left.type !== 'Literal' || list[i].args[0].right.type !== 'Literal') {
						if(!result.includes(list[i])){
							result.push(list[i]);
						}
					}
					break;//Might be concatinating
				case 'CallExpression':
					result.push(list[i]);
					break;
				default:
					result.push(list[i]);
				break;
			}
	}
	return result;
}

const vulnerabilityFinder = function(tree, dir, type="") {
	let result = [];
	let calls = [];
	let entries = [];
	for (var j = 0; j < injections.length; j++){
		if (type === "" || type === injections[j].type) {
			let blank = [];
			if (injections[j].type === 'js_extra'){
				blank = [packageData({name: ''}, null, tree, null, 's', dir)];
			}else{
				blank = [packageData({name: ''}, null, tree, null, 'm', dir)];//blank data struct to fill
			}
			for (var k = 0; k < injections[j].sinks.length; k++) {
				calls = filter(injections[j].sinks[k], blank);
				if (!injections[j].pattern){
					entries = calls;
				} else if (injections[j].pattern.length > 1){
					entries = filterRequire(injections[j].pattern[1], filter(injections[j].pattern[0], calls));
				}else{
					entries = filterRequire(injections[j].pattern[0], calls);
				}
				var dangerousCalls = verifyArgs(entries);
				for (var i = 0; i < dangerousCalls.length; i++) {
					if (!result.includes(dangerousCalls[i].receiver.loc.start.line)) {
						result.push(injections[j].type, dangerousCalls[i].receiver.loc.start.line);
					}
				}
			}
		}
	}
	return result;
};

const dirScan = function(curpath, curfiles){
	var data = {
		dir   : curpath,
		files : []
	};

	for (var i = 0; i < curfiles.length; i++) {
		var file = {
			name  : null,
			vulns : []
		};
		if (path.extname(curfiles[i]) === '.js' && curfiles[i][0] !== '.' && !curfiles[i].includes('min')
				&& curfiles[i] !== 'test.js' && curfiles[i] !== 'example.js'){
			file.name = curfiles[i];
			// console.log("building tree for: "+file.name+" in: "+ data.dir);
			try {
				const ast = buildLinkedASTFromFile(path.resolve(data.dir, file.name));
				found = vulnerabilityFinder(ast, data.dir, vFilter);
				if(found.length !== 0) {
					container = [];

					container.push({
						type : [found[0], 1],
						line : [found[1]]
					})
					if (found.length !== 2) {
						for (var k = 2; k < found.length; k += 2) {
							for (var m = 0; m < container.length; m++) {
								if (container[m].type[0] === found[k]){
									container[m].type[1] += 1;
									container[m].line.push(found[k+1])
								}else if(m == container.length - 1){
									container[m + 1] = {
										type : [found[k], 1],
										line : [found[k+1]]
									};
								}
							}
						};
					}
					file.vulns = container;
					data.files.push(file);
				};
			} catch (e) {
				report.results.push(data.dir + " In file: " + file.name+ '\nHas error: ' +e.name+ ' ' + e.message+ '\n\n')
				//stream.write(data.dir + " In file: " + file.name+ '\nHas error: ' +e.name+ ' ' + e.message+ '\n\n');
			};
		}else{
			if(fs.lstatSync(data.dir + '/'+ curfiles[i]).isDirectory() && curfiles[i] !== 'test'
					&& curfiles[i] !== 'tests' && curfiles[i] !== 'example' && curfiles[i] !== 'examples'){
				const newpath = path.resolve(data.dir, curfiles[i]);
				const newfiles = fs.readdirSync(newpath);
				var result = dirScan(newpath, newfiles);
			}
		}
	};
	if (data.files.length !== 0) response.results.push(data);
	return response;
};

const targetDir = path.resolve(process.argv[2], '');
var vFilter = '';
if (process.argv[3]) vFilter = process.argv[3];

if(vFilter === "--help" || vFilter === "--h"){
	console.log("\nUsage:\n\'node syntaxSearchTool_V2.js <target directory> <options> <filter>\'\n");
	console.log("<options>:");
	console.log("\t--help/--h:\tHow to run the tool.");
	console.log("\t--c/--clear:\tClears the log and review files.");
	console.log("This field may be left blank\n");
	console.log("<filter>:");
	console.log("\tAny of the following types: "+types);
	console.log("This field may be left blank\nOnly the clear option and true/a filter combination will scan\n");
}else if((vFilter === "--c" || vFilter === "--clear") && process.argv.length === 4){
	fs.closeSync(fs.openSync("log.json", 'w'));
	fs.closeSync(fs.openSync("review.json", 'w'));
}else if (process.argv.length === 5 && (!types.includes(process.argv[4]) ^ ['true','True'].includes(process.argv[4]))){
	console.log("Incorrect filter");
}else{
	console.log("Starting Scan...\n");
	var stream, contents;
	if (vFilter === "--c" || vFilter === "--clear" && process.argv.length === 5) {
		fs.closeSync(fs.openSync("log.json", 'w'));
		fs.closeSync(fs.openSync("review.json", 'w'));
		vFilter = process.argv[4];
	}
	try {
		if (fs.existsSync("log.json")) {
			contents = fs.readFileSync("log.json", "utf8");
			if (contents == '') contents = "[]";
		}else {
			fs.openSync("log.json", "a");
			contents = "[]";
		}
		if (fs.existsSync("review.json")) {
			stream = fs.readFileSync("review.json", "utf8");
			if (stream == '') stream = "[]";
		}else {
			fs.openSync("review.json", "a");
			stream = "[]";
		}
	}catch(e) {
		console.log(e);
		console.error("Could not create logging files!");
		contents = "[]";
		stream = "[]";
	}

	var prevResults, prevReport;
	try {
		prevResults = JSON.parse(contents);
	}catch(e) {
		console.log(e);
		console.error("Could not parse prevResults!");
		prevResults = [];
	}
 try {
	prevReport = JSON.parse(stream);
 } catch (e) {
	 console.log(e);
	 console.error("Could not parse prevReport!");
	prevReport = [];
 }
	var response = {
		runStarted: Date().toString(),
		results : []
	};

	var report = {
		runStarted: Date().toString(),
		results : []
	}

	const content = dirScan(targetDir, fs.readdirSync(targetDir));
	prevResults.push(content);
	prevReport.push(report);

	fs.writeFileSync('log.json', JSON.stringify(prevResults, null, '    '), 'utf8', function (err) {
	   if (err) return console.log(err);
	 });
	fs.writeFileSync('review.json', JSON.stringify(prevReport, null, '    '), 'utf8', function (err) {
	  if (err) return console.log(err);
	});

	console.log("Finished scan.\n");
}
/*  DEBUGGING SECTION  */

// var d = path.resolve('../bench', 'exploitable.js');
// const ast = buildLinkedASTFromFile(d);
// console.log(ast.body[3].declarations[0]);
// // console.log(ast.body[4].expression.callee);
// // data = vulnerabilityFinder(ast, d);
// // // //execData = mySQLVulnerabilityFinder(ast, d);
// // console.log(data);
