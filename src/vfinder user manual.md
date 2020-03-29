# Vulnerability Finder User Manual

This manual will go over how to run the vulnerability finder, read the output, and analyze the sink locations. The analysis will determine if the sink location is a true positive or false positive. The package this tool will go through as an example is `Prototype @ 0.0.5`. Documentation on the package can be found [here](https://www.npmjs.com/package/prototype).

## How to Run

### CLI Arguments

### Video Example

## Output

### Log.json

The `log.json` file will contain the following JSON object:

- \[Array\]: Contains results for individual runs of the finders.
  - runStarted \[String\]: Timestamp of when the run was started.
  - results \[Array\]: Contains objects tied to individual directories in which sink(s) were found.
    - dir \[String\]: Full directory path.
    - files \[Array\]: Contains objects tied to individual files within the directory in which sink(s) were found.
      - name \[String\]: File name.
      - package \[String\]: Containing package name, if run with automated workflow.
      - vulns \[Array\]: Contains objects tied to individual sinks found within the file.
        - type \[Array\]: Contains a \[String\] and an \[Int\] describing the sink type (js_function, js_extra, ...) and the amount of this type found within the file.
        - line \[Array\]: Contains the line numbers on which this sink type was found. The length of this array is the value at index 1 of the `type` array.

### Review.json

The `review.json` file will contaon the following JSON object:

* \[Array\]: Contains any errors for individual runs of the finders.
  * runStarted \[String\]: Timestamp of when the run was started.
  * results \[Array\]: Contains string of file location and error message.



## Analyzing results

