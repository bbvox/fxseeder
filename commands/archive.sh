#!/bin/bash

tar --exclude "node_modules" --exclude ".nyc_output" --exclude "coverage" -czvf fxseeder.tar.gz *

# change commit author
# git commit --amend --author="bb <b.bakov@gmail.com>"
