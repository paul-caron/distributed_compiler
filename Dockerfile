FROM alpine:latest
RUN apk update
RUN apk add clang
RUN apk add build-base

