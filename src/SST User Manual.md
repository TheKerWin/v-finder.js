# SST User Manual 

This tool creates an abstract syntax tree (AST) for the javascript program it's given and searches for patterns that match code injections. It searches for the sinks and filters the arguments to ensure the result could possibly vulnerable. The `signatures.js` file makes adding vulnerable syntaxes and package APIs easier.

### Dependencies

Install the following modules that this tool depends on before use. Install the following using npm:

- acorn
- estree-walker
- fs
- path

## Usage
To start the tool's scan, type this into the terminal: ```node sst.js <path/to/target/directory> <options> <filter>```

`` 	<options>:
		--help/--h:		How to run the tool.
		--c/--clear:	Clears the log and review files.
		This field may be left blank
`` 	

``<filter>:
		Any of the following types: 'sql', 'os_cmd', 'js_inject', 'js_function', 'js_extra',''
		This field may be left blank.``	

``Only the --c option and true, or one of the filters, combination will scan.``

In the directory of the tool, it will output `log.json` , a json file with information about each file and the vulnerabilities it found and a `review.json` with information about files it could not parse.

If the `log.json` file already exists, the finder will append the current findings object to the array within the file, thus keeping a historical record of individual runs.

## Output

The `log.json` file will contain the following JSON object:
- \[Array\]: Contains results for individual runs of the finders.
	- runStarted \[Int\]: Timestamp of when the run was started.
	- results \[Array\]: Contains objects tied to individual directories in which sink(s) were found.
		- dir \[String\]: Full directory path.
		- files \[Array\]: Contains objects tied to individual files within the directory in which sink(s) were found.
			- name \[String\]: File name.
			- package \[String\]: Containing package name, if run with automated workflow.
			- version \[String\]: Full version string of the package, usually in the format of 'packagename-version'.
			- state \[String\]: Descriptor for vulnerability state (Vulnerable, SafeBefore, SafeAfter).
			- vulns \[Array\]: Contains objects tied to individual sinks found within the file.
				- type \[Array\]: Contains a \[String\] and an \[Int\] describing the sink type (js_function, js_extra, ...) and the amount of this type found within the file.
				- line \[Array\]: Contains the line numbers on which this sink type was found. The length of this array is the value at index 1 of the `type` array.

## Example Usage

Run the tool as follows: `node sst.js ./`. This will scan the current directory and show the results from the bench directories.