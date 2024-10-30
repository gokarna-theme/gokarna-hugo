#! /usr/bin/env dash

set -eux

# Build a Python container which runs screenshot.py

PLATFORM='podman'

while getopts p:h flag
do
    case $flag in
        p ) PLATFORM=$OPTARG ;;
        \? | h | * )
            printf '%b' 'generate-screenshots.sh [-p buildah|docker|podman]\n  -p: platform binary (default: podman)\n' ;;
    esac
done

readonly TAG='gokarna-screenshot.py-image'
readonly NAME='gokarna-screenshot.py-container'

main ()
{
    result=$($PLATFORM ps --all --quiet --filter name=$NAME)
    if [ -n "$result" ]
    then
        $PLATFORM rm $NAME
    fi

    $PLATFORM build --tag=$TAG -- .
    $PLATFORM run --name=$NAME -- $TAG
    $PLATFORM cp $NAME:/usr/src/app/images/ .
}

main "$@"
