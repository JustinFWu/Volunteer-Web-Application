# Template Repository for COMP SCI 2207/7207 Web & Database Computing (2023 Semester 1)

Contains environment files for WDC 2023. Copy this template for a general sandbox.

Auto commit/push/sync to Github is disabled by default in this template repository.
Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

Note: 
- The main branch is testing2 branch.
- the setup-and-start.sh script is to make sure mysql is running and then imports dump is loaded mysql in the database group_project_test 

A dump of the database is in the repository:
group_project_test.sql

Steps to run:
- download and unzip 24S1_WDC_UG_Group_82-testing2.zip
- open folder in Visual Studio Code
- reopen in dev container
- run npm install
- then run npm start
- you may need to press enter a few times when asked for mysql password

Potential errors:
- sometimes an error occurs saying that setup-and-start.sh is not found

Steps to fix:
1. rename the setup-and-start.sh to setup-and-start1.sh
2. create a new setup-and-start.sh file in the folder
3. copy and paste the code from setup-and-start1.sh to the new setup-and-start.sh file
4. run chmod +x setup-and-start.sh
5. re-run npm start
