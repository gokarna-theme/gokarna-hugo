#! /usr/bin/env dash

set -eux

# Build a Python container which runs screenshot.py

PLATFORM='podman'

usage ()
{
    printf '%b' 'usage: generate-screenshots.sh [-p buildah|docker|podman]\n'
    exit "$1"
}

while getopts p:h flag
do
    case $flag in
        p ) PLATFORM=$OPTARG ;;
        h )
            usage 0 ;;
        * )
            usage 1 ;;
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
