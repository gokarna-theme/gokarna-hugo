#! /usr/bin/env dash

PLATFORM=podman

main ()
{
    local tag='gokarna-screenshot.py-image'
    local name='gokarna-screenshot.py-container'

    "$PLATFORM" rm "$name"

    "$PLATFORM" build --tag="$tag" -- .
    "$PLATFORM" create --name="$name" -- "$tag"
    "$PLATFORM" start "$name"
    # "$PLATFORM" container cp "$name":/usr/src/app/images/ .
}

main
