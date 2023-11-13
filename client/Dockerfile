FROM alpine:latest
RUN apk update

RUN apk add clang
RUN apk add build-base

RUN apk add perl

RUN apk add python3

RUN apk add ruby

RUN apk add rust

RUN apk add go

RUN apk add openjdk11

RUN apk add nodejs npm

COPY ./compilation_scripts /compilation_scripts/
RUN chmod 777 /compilation_scripts/*
