#!/bin/sh

# # Parametro version vacio?
# if [[ "$1" == "" ]]; then
#   echo "uso: 'to_version.sh version'"
#   exit
# fi

# # Cambiamos la linea que tiene la version del app.yaml
# cat src/configs/global.js | sed 's/^version: \(.*\)$/version: '$1'/g' > global.js.tmp
# mv gobal.js.tmp src/configs/global.js


version_line="$(grep '^const version' src/configs/global.js)"
# echo $version_line
version_value=$(echo $version_line | cut -d\' -f2 | cut -d\' -f2)
# echo $version_value

version_1=$(echo $version_value | awk '{split($0,a,"."); print a[1]}') 
# echo $version_1

version_2=$(echo $version_value | awk '{split($0,a,"."); print a[2]}') 
# echo $version_2

version_3=$(echo $version_value | awk '{split($0,a,"."); print a[3]}') 
# echo $version_3

version_3_inc=$(($version_3+1))
increased_version="$version_1.$version_2.$version_3_inc"

# Cambiamos la linea que tiene la version del global.src
cat src/configs/global.js | sed 's/^const version\(.*\)$/const version = '\'$increased_version\'';/g' > global.js.tmp

mv global.js.tmp src/configs/global.js

echo $increased_version

# echo "1.0.1" | awk '{split($0,a,"."); print a[1],print a[2],print a[3]}'
# echo "1.2.3" | awk '{split($0,a,"."); print a[1]}'