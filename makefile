.PHONY: serve
serve:
	npx serve ./public

.PHONY: dev
dev:
	make serve

.PHONY: test
test:
	node --test