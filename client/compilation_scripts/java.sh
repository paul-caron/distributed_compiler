#!/bin/sh
#java language compilation
javac  /source/main.java 2> /source/stderr 1> /source/stdout
(cd source && java Main < /source/stdin 2>> /source/stderr 1>> /source/stdout)
