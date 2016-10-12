#!/bin/sed -i

1d
/path/,$!d
s#</g>#</symbol>#g
1,1s#^#  <symbol viewBox="0 0 32 32" id="icon-{abr}">&\n#
1,1s#^#<svg xmlns="http://www.w3.org/2000/svg" >&\n#
