FROM alpine:latest
RUN apk update
RUN apk add clang
RUN apk add build-base
COPY ./compilation_scripts /compilation_scripts/
RUN chmod 777 /compilation_scripts/*
