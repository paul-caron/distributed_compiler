#!/bin/sh
#rust language compilation
rustc -o /source/main /source/main.rs 2> /source/stderr 1> /source/stdout
/source/main < /source/stdin 2>> /source/stderr 1>> /source/stdout
