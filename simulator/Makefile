BROWSERIFY_FLAGS := --debug

PHONY: rebuild

rebuild: clean dist

$(REQUIRED_TOOLS):
	@hash $@ 2>/dev/null || (echo "please install $@" && exit 1)

dist:
	@echo "building"
	@mkdir -p dist
	@browserify src/simulator.js > dist/simulator.js $(BROWSERIFY_FLAGS)
	@browserify src/content.js > dist/content.js $(BROWSERIFY_FLAGS)
	@browserify src/index.js > dist/index.js $(BROWSERIFY_FLAGS)
	@cat src/manifest.json > dist/manifest.json
	@cp src/*.png dist

clean:
	@rm -rf dist

zip: rebuild
	@rm bundle.zip
	@zip -r bundle.zip dist/*
