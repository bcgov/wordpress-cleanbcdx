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
BACKUP_NUMBER=$8
S3_TOKEN=$9

# Log in to OpenShift
echo "::group::Login to Production OC"
oc login $OPENSHIFT_SERVER --token=$PROD_TOKEN              #--insecure-skip-tls-verify=true
echo "::endgroup::"


#copy down the backup file from s3
echo "Grabbing the backup filename"
CMD_RESULTS=$(rclone lsf :s3:clbcdx/oc-sites-bk --include "$PROJECT_NAME-prod_prod_*_backup.tar" --files-only --s3-provider Other --s3-access-key-id "nr-cleanbcdx-pr" --s3-secret-access-key "$S3_TOKEN" --s3-endpoint "https://nrs.objectstore.gov.bc.ca"  | tail -n $BACKUP_NUMBER | head -n $BACKUP_NUMBER )

S3_FILENAME=$CMD_RESULTS

echo "Grabbing backup file: $S3_FILENAME"
CMD1_RESULTS=$(rclone copy :s3:clbcdx/oc-sites-bk/$S3_FILENAME . --s3-provider Other --s3-access-key-id "nr-cleanbcdx-pr" --s3-secret-access-key "$S3_TOKEN" --s3-endpoint "https://nrs.objectstore.gov.bc.ca" -P --stats-log-level NOTICE --stats 60s 2>&1)
CMD1_EXIT_CODE=$?
echo "${CMD1_EXIT_CODE}"
echo "${CMD1_RESULTS}"

    
if [[ "$CMD1_EXIT_CODE" -eq 0 && -f "$S3_FILENAME" ]]; then 
    case "$ENVIRONMENT" in
        "dev")
        token=$DEV_TOKEN
        ;;
        "test")
        token=$TEST_TOKEN
        ;;
        "prod")
        token=$PROD_TOKEN
        # echo "For safety reasons, we won't run this action on prod!"
        # exit 1
        ;;
        *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
    esac

    OC_ENV=$ENVIRONMENT
    if [ "$SITE_NAME" = "$PROJECT_NAME" ]; then
        OC_SITE_NAME="$PROJECT_NAME"
    else
        OC_SITE_NAME="$PROJECT_NAME-$SITE_NAME"
    fi

    echo "Deploying to the site $OC_SITE_NAME in $OC_ENV"

    # Log in to OpenShift
    echo "::group::Login to target OC"
    oc login $OPENSHIFT_SERVER --token=$token                   #--insecure-skip-tls-verify=true
    echo "::endgroup::"


    NAMESPACE="f181a8-$ENVIRONMENT"
    WORDPRESS_POD_NAME=$(oc get pods -n $NAMESPACE -l app=wordpress,role=wordpress-core,site=${OC_SITE_NAME} -o jsonpath='{.items[0].metadata.name}')
    WORDPRESS_CONTAINER_NAME=$(oc get pods -n $NAMESPACE $WORDPRESS_POD_NAME -o jsonpath='{.spec.containers[0].name}')

    DB_POD_NAME=$(oc get pods -n $NAMESPACE -l app=wordpress,role=mariadb,site=${OC_SITE_NAME} -o jsonpath='{.items[0].metadata.name}')
    DB_CONTAINER_NAME=$(oc get pods -n $NAMESPACE $DB_POD_NAME -o jsonpath='{.spec.containers[0].name}')

    if [ -z "$WORDPRESS_CONTAINER_NAME" ]; then
        echo "::error::Unknown site name: ${SITE_NAME}"

        exit 1
    fi 

    

    #erase any cleanbc plugin assets before restore
    # echo "Cleaning the bcgov-plugin-cleanbc/dist/assets folder"
    # set +e
	# CLEANBCPLUGIN_VERSION=$(oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- php /tmp/wp-cli.phar plugin get bcgov-plugin-cleanbc --field=version 2>&1)
	# CLEANBCPLUGIN_VERSION_EXIT_CODE=$?
	# set -e
	# if [ CLEANBCPLUGIN_VERSION_EXIT_CODE -eq 0 ]; then		
    #     oc exec  -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- bash -c "rm /var/www/html/wp-content/plugins/bcgov-plugin-cleanbc/dist/assets/*"
    
	# else
	# 	echo "bcgov-plugin-cleanbc Not installed"

	# 	echo "::warning::bcgov-plugin-cleanbc Not installed"
	# fi
    

    #perform the restore
    echo "Running restore"
    echo " Namespace: ${NAMESPACE}"
    echo " Container Name: ${WORDPRESS_CONTAINER_NAME}"
    echo " Pod Name: ${WORDPRESS_POD_NAME}"
    

    tar -xvf $S3_FILENAME
    #should end up with db.sql.gz and files.tar.gz


    #move the destination wp-content to wp-content-bk
    echo "Moving wp-content to wp-content-bk"
    oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- mkdir -p /var/www/html/wp-content-bk
    oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- sh -c 'mv /var/www/html/wp-content/* /var/www/html/wp-content-bk'


    echo "::group::Restore DB backup"
    #TODO this restore doesnt work. may need to copy the file then do restore.
    oc cp db.sql.gz -n $NAMESPACE -c $DB_CONTAINER_NAME $DB_POD_NAME:/tmp/db.sql.gz
    
    set +e
    CMD1_RESULTS=$( (oc exec -n $NAMESPACE -c $DB_CONTAINER_NAME $DB_POD_NAME -- sh -c 'gunzip < db.sql.gz | mariadb  -u root -p$(cat $MYSQL_ROOT_PASSWORD_FILE) $MYSQL_DATABASE' ) 2>&1)
    CMD1_EXIT_CODE=$?
    set -e

    oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- rm /tmp/db.sql.gz
    oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- rm /tmp/db.sql

    if [ $CMD1_EXIT_CODE -eq 0 ]; then
        echo "Success restoring database backup"
        echo "Code: $CMD1_EXIT_CODE"
        echo "$CMD1_RESULTS"

    else
        echo "Error restoring database backup:"
        echo "Code: $CMD1_EXIT_CODE"
        echo "$CMD1_RESULTS"
        exit 99
    fi

    echo "::endgroup::"


    echo "::group::Restore Files backup"
    #TODO restore files. only wp-content
    echo "::endgroup::"

    
    #Disable site indexing
    oc exec -n $NAMESPACE -c $WORDPRESS_CONTAINER_NAME $WORDPRESS_POD_NAME -- php /tmp/wp-cli.phar option set blog_public 0


    echo "Restore backup finished"


    #Generate GH Actions summary
	echo "### Restored Backup" >> $GITHUB_STEP_SUMMARY
	echo "Environment: ${OC_ENV}" >> $GITHUB_STEP_SUMMARY
    echo "Project: ${PROJECT_NAME}" >> $GITHUB_STEP_SUMMARY
	echo "Site: ${OC_SITE_NAME}" >> $GITHUB_STEP_SUMMARY
    echo "Backup number: ${BACKUP_NUMBER}" >> $GITHUB_STEP_SUMMARY
	echo "" >> $GITHUB_STEP_SUMMARY # this is a blank line


else  
    echo "::error::Backup file not found!"

	#Generate GH Actions summary
	echo "### Restore Backup Error" >> $GITHUB_STEP_SUMMARY
	echo "Environment: ${OC_ENV}" >> $GITHUB_STEP_SUMMARY
    echo "Project: ${PROJECT_NAME}" >> $GITHUB_STEP_SUMMARY
	echo "Site: ${OC_SITE_NAME}" >> $GITHUB_STEP_SUMMARY
    echo "Backup number: ${BACKUP_NUMBER}" >> $GITHUB_STEP_SUMMARY
	echo "" >> $GITHUB_STEP_SUMMARY # this is a blank line
	
	exit 1
fi