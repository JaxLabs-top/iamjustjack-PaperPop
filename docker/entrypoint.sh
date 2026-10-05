#!/bin/sh
node /opt/paperpop/mcp/http.mjs &
exec nginx -g 'daemon off;'
