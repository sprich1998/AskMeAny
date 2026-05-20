#!/bin/sh
set -e

export DISPLAY="${DISPLAY:-:99}"

if [ "${ENABLE_VNC:-true}" = "true" ]; then
  Xvfb "${DISPLAY}" -screen 0 1280x720x24 &
  sleep 1
  x11vnc -display "${DISPLAY}" -forever -shared -nopw -rfbport 5900 &
  websockify --web /usr/share/novnc 6080 localhost:5900 &
fi

exec node dist/index.js
