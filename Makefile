.PHONY: build
build:
	docker compose build
	docker compose up -d


.PHONY: launch
launch:
	open ./.docker/main/web/index.html


.PHONY: start
start:
	docker compose start


.PHONY: stop
stop:
	docker compose stop


.PHONY: ssh
ssh:
	docker compose exec -ti main bash
