# Syntax Search Tool

This tool creates an abstract syntax tree (AST) for the javascript program it's given and searches for patterns that match code injections. It searches for the sinks and filters the arguments to ensure the result could possibly vulnerable. For more informtion on how to use and run this tool, read <b>SST User Manual</b>. 



## Within this directory:

### bench and bench_packages:

​	These directories contain javascript examples to test our tool to ensure accurate findings. 

### sst.js and signatures.js:

​	These files are the source code for the tool to work. `sst.js` is the interface that collects and outputs information and findings. `signatures.js` is the file that contains the AST patterns and the list of vulnerabilities the tool will currently look for. For more information about how the tool works and how to run it, read <b>SST User Manual</b>. 

### readme.md and SST User Manual.md:

​	These documents explain the contents of this directory and how the syntax search tool works respectivley. 