#!/bin/bash
languages=("go" "python" "typescript")

for language in "${languages[@]}"; do
    echo "Testing $language example"
    dagger -m bluesky/_examples/$language call bluesky-post
done