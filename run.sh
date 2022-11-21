#!/bin/bash
tail -F /var/log/app.log &
exec deno run --allow-all main.ts