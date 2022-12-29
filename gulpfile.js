const { copyFile, cp, mkdir } = require('fs/promises')
const { parallel, series } = require('gulp')
const { spawn } = require('child_process')

exports.default = series()
