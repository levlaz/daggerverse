#!/bin/bash
languages=("go" "python" "typescript")

for language in "${languages[@]}"; do
    echo "Testing $language example"
    dagger -m examples/$language call bluesky-post
done