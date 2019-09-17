#!/bin/bash

tar --exclude "node_modules" --exclude ".nyc_output" --exclude "coverage" -czvf fxseeder.tar.gz *
