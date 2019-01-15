set -e -x

trap "exit" INT

nyc jest --maxWorkers=2 --detectOpenHandles --forceExit --coverage --coverageDirectory .nyc_output --coverageReporters json
