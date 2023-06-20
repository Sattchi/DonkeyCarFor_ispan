#!/bin/bash

node index.js

if ["${1}" == "stop"]; then
    # kill | [ ps -aux | grep "index.js" ]
    systemctl disable sshd.service
fi

exit 0;

