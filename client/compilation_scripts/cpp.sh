#!/bin/sh
#cpp language compilation
clang++ -O1 -o /source/main /source/main.cpp 2> /source/stderr 1> /source/stdout
/source/main < /source/stdin 2>> /source/stderr 1>> /source/stdout
