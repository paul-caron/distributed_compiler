#!/bin/sh
#c language compilation
clang -O1 -o /source/main /source/main.c 2> /source/stderr 1> /source/stdout
/source/main < /source/stdin 2>> /source/stderr 1>> /source/stdout
