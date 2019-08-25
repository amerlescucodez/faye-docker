.PHONY: all

all:

build:
	docker build -t faye-docker:1.0.2

run:
	docker-compose up -d