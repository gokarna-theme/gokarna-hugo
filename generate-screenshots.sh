#! /usr/bin/env dash

set -eux

# Build a Python container which runs screenshot.py

usage ()
{
    printf '%b' 'usage: generate-screenshots.sh [-h] [-p DOCKER|podman]\n'
    exit "$1"
}

PLATFORM='docker'

while getopts p:h flag
do
    case $flag in
        p ) PLATFORM=$OPTARG ;;
        h ) usage 0 ;;
        * ) usage 1 ;;
    esac
done

main ()
{
    local tag='gokarna-screenshot.py-image'
    local name='gokarna-screenshot.py-container'

    result=$($PLATFORM ps --all --quiet --filter name=$name)
    if [ -n "$result" ]
    then
        $PLATFORM rm $name
    fi

    $PLATFORM build --tag=$tag -- .
    $PLATFORM run --name=$name -- $tag
    $PLATFORM cp $name:/usr/src/app/images/ .
}

main
