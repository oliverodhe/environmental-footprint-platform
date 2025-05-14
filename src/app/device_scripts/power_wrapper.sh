#!/bin/bash

# Create temporary files
POWER=$(mktemp)

# Get path of this file to avoid path errors
SCRIPT_PATH=$(dirname "$(realpath "$0")")

# Start measuring power
"${SCRIPT_PATH}"/power_sampler.sh $POWER &
PID=$!

# Get start time in nanoseconds
start_time=$(date +%s%6N)

# Start the actual program
# echo "Power wrapper running: $@"
$@

# Kill power measurements
kill $PID

# Get end time in nanoseconds
end_time=$(date +%s%6N)

elapsed_nsec=$((end_time - start_time))
elapsed_sec=$(awk "BEGIN {printf \"%.6f\",${elapsed_nsec}/1000000}")

# Compute and display average power and energy

## Remove last line from file to avoid incomplete lines
sed -i '$ d' $POWER

## Compute power results
p=$(cat $POWER | awk '{sumX+=+$1;sumX2+=(($1)^2)}END{if (NR>1) printf "%.3f", sumX/(NR)}')
e=$(awk "BEGIN {printf \"%.3f\",${elapsed_sec}*${p}}")
rm $POWER

echo "Exectution time = ${elapsed_sec}s"
echo "Average power   = ${p}W"
echo "Energy consumed = ${e}J"
