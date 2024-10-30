#! /usr/bin/env dash

# Build a Python container which runs screenshot.py

# At least one platform must be installed to $PATH

#readonly PLATFORM=buildah
#readonly PLATFORM=docker
readonly PLATFORM=podman

main ()
{
    local tag='gokarna-screenshot.py-image'
    local name='gokarna-screenshot.py-container'

    # Remove existing container
    "$PLATFORM" rm "$name"

    "$PLATFORM" build --tag="$tag" -- .
    "$PLATFORM" create --name="$name" -- "$tag"
    "$PLATFORM" start "$name"
    # "$PLATFORM" container cp "$name":/usr/src/app/images/ .
}

main
