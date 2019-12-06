# Vulnerability Finder Tool

This package can search a given directory for JavaScript files and return any potential sinks, or vulnerable code that could be exploitable. The information is placed in a json file that tells the user the time of the run, the file location, the type of vulnerability, and the line number(s).



## vfinder.js V.S. signatures.js:

These files are the source code for the tool to work. The `vfinder.js` is the interface that collects and outputs information and findings. The `signatures.js` is the file that contains the patterns and the list of vulnerabilities the tool will look for. Both source files work together to return the results on a target directory. For more information about how the tool works and how to run it and analyze the data, read the [VFinder User Manual](https://github.com/TheKerWin/v-finder.js/blob/master/src/vfinder%20user%20manual.md).  



## Dependencies

Install the following modules that this tool depends on before use. Install the following using npm:

- acorn

- estree-walker

- fs

- path

  

## Quick Start Usage

To start the tool's scan, type this into the terminal: ```node vfinder.js <path/to/target/directory> <options> <filter>```

`` 	<options>:
		--help/--h:		How to run the tool.
		--c/--clear:	Clears the log and review files.
		This field may be left blank
`` 	

``<filter>:
		Any of the following types: 'sql', 'os_cmd', 'js_inject', 'js_function', 'js_extra',''
		This field may be left blank.``	

``Only the --c option and true, or one of the filters, combination will scan.``

The filters are tag names for known, dangerous APIs. They can be looked at further in the `signatures.js` file.

In the directory of the tool, it will output `log.json` , a json file with information about each file and the vulnerabilities it found and a `review.json` with information about files it could not parse.

If the `log.json` file already exists, the finder will append the current findings object to the array within the file, thus keeping a historical record of individual runs.



## Example Run

Run the tool as follows: `node vfinder.js ../`. This will scan the current directory and show the results from the bench directories. Here is a sample of one of the results:

```json
        "runStarted": "Fri Dec 06 2019 15:16:07 GMT-0500 (Eastern Standard Time)",
        "results": [
            {
                "dir": "/Users/alexoneill/Documents/GitHub/v-finder.js/bench",
                "files": [
                    {
                        "name": "b01c.js",
                        "vulns": [
                            {
                                "type": [
                                    "os_cmd",
                                    5
                                ],
                                "line": [
                                    4,
                                    5,
                                    10,
                                    19,
                                    28
                                ]
                            }
                        ]
```

Above, the object returns the date and time of when the tool was run. In the results, it shows the directroy of the files that the tool returned positive findings on. In the files attribute, the name of the file is displayed and under that the type(s) and line number(s) of the potential sink's location.