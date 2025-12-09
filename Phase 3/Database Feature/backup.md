How to use the backup and recovery database features:
  move the files (backupMac.sh and restoreMac.sh) into a new directory with an identical .env as the web app
  activate the files before running them ('chmod +x backupMac.sh' and 'chmod +x restoreMac.sh')

To run: 
  './backupMac.sh' will create an image of the database and place it in the same directory for future use
  './restoreMac.sh <backupfilename.sql> <databasename>' will restore the selected image to the selected database (slightly broken as of now)
