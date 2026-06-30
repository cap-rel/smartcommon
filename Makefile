# smartcommon - convenience wrappers around npm scripts.
# All real logic lives in package.json. This file is just a shortcut.

.PHONY: help install dev build test test-build test-coverage test-stories lint lint-fix storybook storybook-build storybook-build-debug clean check

help: ## Show this help.
	@echo "smartcommon - available targets:"
	@echo
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  make %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo

install: ## Install npm dependencies.
	npm install

dev: ## Start the Vite dev server.
	npm run dev

build: ## Build the library bundle into dist/.
	npm run build

test: ## Run the full Vitest suite once.
	npm run test:run

test-build: ## Rebuild dist/ then smoke-test the bundle (covers the minified output).
	npm run test:build

test-coverage: ## Run the suite with coverage reports.
	npm run test:coverage

test-stories: ## Build Storybook then smoke-test every story + docs page (headless).
	npm run test:stories

lint: ## Run ESLint.
	npm run lint

lint-fix: ## Run ESLint and apply auto-fixes.
	npm run lint:fix

storybook: ## Start Storybook on port 6006.
	npm run storybook

storybook-build: ## Build Storybook static site.
	npm run build-storybook

storybook-build-debug: ## Build Storybook static site unminified (readable error stacks).
	npm run build-storybook:debug

clean: ## Remove build artefacts.
	rm -rf dist storybook-static

check: lint test build ## Lint, test, then build. Use this before publishing.
