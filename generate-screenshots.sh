#! /usr/bin/env dash

set -eux

# Build a Python container which runs screenshot.py

# At least one platform must be installed to $PATH

#readonly PLATFORM=buildah
#readonly PLATFORM=docker
readonly PLATFORM=podman

readonly TAG='gokarna-screenshot.py-image'
readonly NAME='gokarna-screenshot.py-container'

run ()
{
    $PLATFORM rm $NAME
    $PLATFORM run --name=$NAME -- $TAG
}

build_or_update ()
{
    podman inspect --type=image $TAG 1>/dev/null
    # Determine if $TAG exists by evaluating the exit code
    local image_exists=$?

    # If there is no existing image, or -f was given
    if [ $image_exists -ne 0 ] || [ "$1" -eq 1 ]
    then
        $PLATFORM build --tag=$TAG -- .
        run
    elif [ $image_exists -eq 0 ]
    then
        # Update the files in the container
        run
        $PLATFORM cp . $NAME:/usr/src/app/
    fi
}

main ()
{
    local force_rebuild=0

    # If no arguments are given
    if [ $# -eq 0 ]
    then
        return
    elif [ "$1" = f ] || [ "$1" = -f ] || [ "$1" = --force ]
    then
            force_rebuild=1
    fi

    build_or_update $force_rebuild

    $PLATFORM cp $NAME:/usr/src/app/images/ .
}

main "$@"
