all:
	rm -rf gosha
	mkdir gosha
	rsync -av --exclude 'Makefile' --exclude '.eslintrc' --exclude '.eslintignore' --exclude '.gitignore' --exclude '.travis.yml' --exclude '.editorconfig' --exclude 'bin' --exclude 'node_modules' --exclude 'npm-debug.log' --exclude 'package.json' --exclude 'gosha/' --exclude 'Readme.md' --exclude 'Contributing.md' --exclude 'Howto.md' . gosha/
