.PHONY: all

all:

build:
	docker build -t faye-docker:0.0.1

run:
	docker-compose up -d