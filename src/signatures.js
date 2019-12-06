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
const walk = require('estree-walker').walk;		//tree walker function
const types = ['sql', 'os_cmd', 'js_inject', 'js_function', 'js_extra',''];
injections = [
		{
			type : 'sql',
			sinks: ['query'],
			pattern: ['createConnection', 'mysql']
		},
		{
			type: 'os_cmd',
			sinks: ['exec', 'execSync', 'spawn'],
			pattern: ['child_process']
		},
		{
			type: 'os_cmd',
			sinks: ['exec'],
			pattern: ['shelljs']
		},
		// {
		// 	type: 'os_cmd',
		// 	sinks: ['exec'],
		// 	pattern: ['execa']
		// },
		{
			type: 'js_inject',
			sinks: ['eval'],
			pattern: null
		},
		{
			type: 'js_function',
			sinks: ['Function'],
			pattern: null
		},
		{
			type: 'js_extra',
			sinks: ['call', 'apply', ''],
			pattern: null
		}
];

const packageData = function(rec, argz, tree = null, prev = null, typeSearch = null, directory = null){ //packs data to be returned
	return {
		receiver 	: rec,
		args			: argz,
		scope 		: tree,
		previous	: prev,
		type 			: typeSearch,
		path      : directory
	}
};

const methodFinder = function(tree, type, method="", name, ii = null, dir) {
  var result = [];
  walk(tree, { //from estree.walk
    enter: function (node, p, prop, index) { //returns current node, parent node, properties of the node (if it has any), and the index #
      switch (type) {
        case 'm': //if the current node is a method
        if (node.type === 'CallExpression'){
          switch (node.callee.type) {
            case 'Identifier':
            if(node.callee.name === method) {
              if (!node.callee.object) {
                result.push(packageData(node.callee, node.arguments, node.callee));
              }else if (node.callee.object.type === 'Identifier') {
                result.push(packageData(node.callee.object, node.arguments, tree));
              }else if (node.callee.object.type === 'CallExpression') {
                result.push(packageData(node.callee.object, node.arguments, node.callee));
              }
            }
            break;
            case 'MemberExpression':
            if(node.callee.property.name === method || node.callee.property.value === method) {
              if (!node.callee.object) {
                result.push(packageData(node.callee, node.arguments, node.callee));
              }else if (node.callee.object.type === 'Identifier') {
                result.push(packageData(node.callee.object, node.arguments, tree));
              }else if (node.callee.object.type === 'CallExpression') {
                result.push(packageData(node.callee.object, node.arguments, node.callee));
              }else if (node.callee.object.type === 'MemberExpression') {
                result.push(packageData(node.callee.object, node.arguments, tree));
              }
            }
            break;
            case 'SequenceExpression':
              for (var k= 0; k < node.callee.expressions.length; k++) {
                if (node.callee.expressions[k].name === method) {
                  result.push(packageData(node.callee, node.arguments, tree));
                }
              }
              break;

          }
        } else if (node.type === 'Identifier' && node.name === method && p.type ) {
          if (p.type === 'MemberExpression') {
              result.push(packageData(p.object, [{type: 'Nothing'}], p));
          }
        }
        break;

        case 'v': //if the current node is a variable declaration
        if (node.type === 'VariableDeclaration'){
          //console.log(node.declarations[3].id);
          if(node.declarations[0].id.name === name) {
            if (node.declarations[0].init) {
              if (node.declarations[0].init.type === 'CallExpression'){
                switch (node.declarations[0].init.callee.type) {
                  case 'Identifier':
                  if(node.declarations[0].init.callee.name === method) {
                    result.push(packageData(node.declarations[0].init.callee, node.declarations[0].init.arguments, p));
                  }
                  break;
                  case 'MemberExpression':
                  if(node.declarations[0].init.callee.property.name === method) {
                    result.push(packageData(node.declarations[0].init.callee.object, node.declarations[0].init.arguments, p));
                  }
                  break;
                }
              }
            }
          }else if(node.declarations[0].init){//used for function calls with a name
              if (node.declarations[0].init.type === 'FunctionExpression') {
                for (var i = 0; i < node.declarations[0].init.params.length; i++) {
                  if (node.declarations[0].init.params[i].name === name) {
                    let argVal = methodFinder(tree, 'f', method, node.declarations[0].id.name, i);
                    let argRes = methodFinder(tree, type, method, argVal[0]);
                    result = argRes;
                  }
                }
              }
            }
          }else if (node.type === 'ExpressionStatement'){
            if (node.expression.type === 'CallExpression') {
              if (node.expression.callee.type === 'FunctionExpression') {//used for lambda function calls
                for (var i = 0; i < node.expression.callee.params.length; i++) {
                  if (node.expression.callee.params[i].name === name){
                    result = methodFinder(tree, type, method, node.expression.arguments[i].name);
                  }
                }
              }
            }
          }
          break;
        case 'f': //searches for parameter defined in a method/function
        if (node.type === 'ExpressionStatement') {
          if (node.expression.callee) {
            if (node.expression.callee.name === name) {
              if (ii === null) {
                result.push(packageData(node.expression.callee, node.expression.arguments, p));
              }else {
                result.push(node.expression.arguments[ii].name);
              }
            }
          }
        }
        break;
        case 'r': // searching for a variable required by another file
        if (node.type === 'VariableDeclaration'){
          if(node.declarations[0].id.name === name[0]) {
            if (node.declarations[0].init.callee) {
              //console.log(node.declarations[0].init.callee);
              if(node.declarations[0].init.callee.name === 'require') {
                let str = node.declarations[0].init.arguments[0].value;
                if (str.includes("/")) {
                  if (str[0] === '.' && str[1] !== '.') {
                    str = path.resolve(dir, str.substring(2));
                  }else if(str[0] === '.' && str[1] === '.'){
                    let holder = path.parse(dir).dir;
                    str = path.resolve(holder, str.substring(3))
                  }
                  let newAST = buildLinkedASTFromFile(str);
                  let findings = methodFinder(newAST, 'e', method, name[1]);
                  if (typeof findings[0] === 'string') {
                    result = methodFinder(newAST, 'm', method, findings[0]);
                  } else{
                    result = findings;
                  }
                }
              }
            }
          }
        }
          break;
          case 'e':
          if (node.type === 'ExpressionStatement') {
            if (node.expression.type === 'AssignmentExpression') {
              if (node.expression.right.type === 'ObjectExpression') {
                for (var i = 0; i < node.expression.right.properties.length; i++) {
                  if (node.expression.right.properties[i].key.name === name) {
                    switch (node.expression.right.properties[i].value.type) {
                      case 'CallExpression':
                      if (node.expression.right.properties[i].callee.property.name === method) {
                        result.push(packageData(node.expression.right.properties[i].value.callee.object, node.expression.right.properties[i].value.arguments, tree));
                      }
                      break;
                      case 'Identifier':
                      result.push(node.expression.right.properties[i].value.name);
                      break;
                    }
                  }
                }
              }else if (node.expression.left.property.name === name) {
                switch (node.expression.right.type) {
                  case 'CallExpression':
                  if (node.expression.right.callee.property.name === method) {
                    result.push(packageData(node.expression.right.callee.object, node.expression.right.arguments, tree));
                  }
                  break;
                  case 'Identifier':
                  result.push(node.expression.right.name);
                  break;
                }
              }
            }
          }

          break;
          case 'a':
          if (node.type === 'AssignmentExpression') {
            if (node.left.name === name) {
              result.push(node.right);
            }
          }else if (node.type === 'VariableDeclarator') {
            if(node.id.name === name){
              result.push(node.init);
            }
          }else {
            result.push({type : 'NotLiteral'});
          }
          break;
          case 's':
            if (node.type === 'CallExpression'){
              if (node.callee.type === 'MemberExpression'){
                if(node.callee.computed) {
                  if (method == "" || (node.callee.property && node.callee.property.name == method)) {
                    if (node.callee.property.type == "ConditionalExpression") {
                      if (node.callee.property.alternate.type == "Literal" &&
                        node.callee.property.consequent.type == "Literal"
                      ) {
                        break;
                      }
                    }
                    else if (node.callee.property.type == "Identifier") {
                      if (node.callee.property.name == "i") {
                        break;
                      }
                    }

                    if (!node.callee.object) {
                      result.push(packageData(node.callee, node.arguments, node.callee));
                    }else if (node.callee.object.type === 'Identifier') {
                      result.push(packageData(node.callee.object, node.arguments, tree));
                    }else if (node.callee.object.type === 'CallExpression') {
                      result.push(packageData(node.callee.object, node.arguments, node.callee));
                    }else if (node.callee.object.type === 'MemberExpression') {
                      result.push(packageData(node.callee.object, node.arguments, tree));
                    }
                  }
                }
              }
            }
          break;
        }
      }
    });
  return result;
};

module.exports = {
  mf: methodFinder,
  inj: injections,
  pkg: packageData,
  typ: types
};
