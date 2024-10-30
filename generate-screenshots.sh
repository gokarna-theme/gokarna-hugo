#! /usr/bin/env dash

set -eux

# Build a Python container which runs screenshot.py

FORCE_REBUILD=0
PLATFORM='podman'

while getopts fp:h flag
do
    case $flag in
        f ) FORCE_REBUILD=1 ;;
        p ) PLATFORM=$OPTARG ;;
        \? | h | * ) printf '%b' 'generate-screenshots.sh [-f] [-p buildah|docker|podman]\n  -f: force image rebuild (skip check for existing image)\n  -p: platform binary (default: podman)\n' && exit 1 ;;
    esac
done

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
    build_or_update "$FORCE_REBUILD"
    $PLATFORM cp $NAME:/usr/src/app/images/ .
}

main "$@"
