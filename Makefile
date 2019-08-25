.PHONY: all

all:

build:
	docker build -t faye-docker:1.0.3

run:
	docker-compose up -d