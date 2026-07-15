#!/bin/bash

# remote="https://smartinterventions-demo.0.doliproxy.fr/api.php"
remote="https://bar.devtemp.fr/custom/smartinterventions/pwa/api.php"

# curl -X POST --header 'Content-Type: application/json' -d '{"email":"inter", "password": "demodemo", "entity": 0}' $remote/login

bearer="20|eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImludGVyIiwiZW50aXR5IjoxfQ.kbP712Rd1u5uTtnu7rDzpaax5jT1FdY2EL4LjOMIp3w"

# route home
curl -X  GET -H "Connection: close" -H "Authorization: Bearer ${bearer}" \
    ${remote}/interventions/mine/3 -v

# list max 10 interventions
# curl -X  GET -H "Connection: close" -H "Authorization: Bearer ${bearer}" \
#     ${remote}/interventions/10 -v

# get details of intervention id8
# curl -X  GET -H "Connection: close" -H "Authorization: Bearer ${bearer}" \
#     ${remote}/intervention/10 -v