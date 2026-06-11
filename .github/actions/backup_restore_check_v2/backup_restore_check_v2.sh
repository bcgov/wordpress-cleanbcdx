#!/bin/bash

#Make sure bash exits on any error so that the github action is marked as error
set -e

ENVIRONMENT=$1
PROJECT_NAME=$2
SITE_NAME=$3
OPENSHIFT_SERVER=$4
DEV_TOKEN=$5
TEST_TOKEN=$6
PROD_TOKEN=$7


NEW_SITE_URL="https://$PROJECT_NAME-$SITE_NAME.apps.gold.devops.gov.bc.ca"
echo "Checking the site $NEW_SITE_URL."


#Perform query to check for status 200
echo "Checking for 200 status"
CMD_RESULTS=$(curl -s -o /dev/null -w "%{http_code}")

if [[ "$CMD_RESULTS" != 200 ]]; then
    echo "::error::Incorrect http status returned, ${CMD_RESULTS}"

    exit 99
fi 

echo "### Checked Restored Site" >> $GITHUB_STEP_SUMMARY
echo "Environment: ${OC_ENV}" >> $GITHUB_STEP_SUMMARY
echo "Project: ${PROJECT_NAME}" >> $GITHUB_STEP_SUMMARY
echo "Site: ${OC_SITE_NAME}" >> $GITHUB_STEP_SUMMARY
echo "" >> $GITHUB_STEP_SUMMARY # this is a blank line
echo "Http Result: $CMD_RESULTS" >> $GITHUB_STEP_SUMMARY


