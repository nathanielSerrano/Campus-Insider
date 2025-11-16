# Phase 2 
Phase 2 of the Campus Insider project consists of creation of the database, including creating the schema and procedures, performing some web scraping to get data, and then inserting that data into the database.

## Navigating Phase 2 Directory
The work for phase 2 has been mostly organized into separate folders.
 * `schema-implementation/` is where all of our `.sql` scripts responsible for defining the schema are stored.
   * Each entity in the schema has its own respective `.sql` file.
   * There is a `Combined Campus Insider.sql` file that contains each of these individual scripts
 * `web-scraping/` is where all of our web-scraping related files are stored. To get our data, we scraped the following websites:
   * American Colleges: https://en.wikipedia.org/wiki/Lists_of_American_universities_and_colleges
   * USM Buildings/Rooms: https://tdx.maine.edu/TDClient/2624/Portal/KB/?CategoryID=22631
   * USM Library Study Rooms: https://libguides.usm.maine.edu/guides/group-study-rooms/
   
The `web-scraping/` directory contains the following:
   * `data/` is a subdirectory that contains JSON files of data attained from web scraping. Any files with the word `clean` appended to the end of the name consist of data that has been modified to suit our database's needs.
   * `college_scrape.py` is a Python script that scrapes the following info on all American universities:
     * Name
     * State
     * Wikipedia link (url)
   * `building_scraper.py` is a Python script that scrapes information on buildings and their classrooms across all USM campuses.
   * `building_cleaner.py` is a Python script that reads the JSON file that `building_scraper.py` created and reformats the data to better suit the needs of our database. The result is outputed to a new JSON file with the word `clean` appended to the end of its filename.
   * `study_room_scraper.py` is a Python script that scrapes information on all library study rooms across all USM campuses, and outputs everything to a JSON file.
   * `data_validation.py` is a Python script that will print the length of the longest values in a JSON file. This is used to ensure that all numbers are within the limits set by our database schema.
   * `insert_rooms.py` is a Python script that reads a cleaned JSON file that contains information about rooms and buildings and inserts them into a MySQL database.
   * `insert_study_rooms.py` is a Python script that reads a JSON file that contains information about USM study rooms and inserts them into a MySQL database.
 * Outside of those folders, there are also some relevant files:
   * `Campus Insider Stored Procedures and Functions Outline.pdf` is a PDF file that contains basic information outlining the procedures and functions utilized by the Campus Insider database.
   * `Functions.sql` contains any functions utilized by the Campus Insider database.
   * `Procedures.sql` contains any procedures utilized by the Campus Insider database.
   * `indices.sql` contains any all index implementations for the Campus Insider database.
   * `queryOptimization.pdf` is a document outlining how the efficiency of two queries was improved via the implementation of indices.
   * `Campus Insider Phase 2 Contributions.pdf` is a document outlining the work that every member did on this phase of the project.

## Launching the Database
Here are the steps to launch the database for Campus Insider. This process includes defining the schema, functions, and procedures, as well as inserting data into the database. To begin, this is a MySQL database; as such, it is recommended to utilize MySQLWorkbench to manage the database, and our instructions are written with MySQLWorkbench in mind.
 * To start, once you've created a new connection in MySQLWorkbench, open and run `schema-implementation/Combined Campus Insider.sql` to create all tables within the database.
 * Next, open and run `Functions.sql` followed by `Procedures.sql` so that all functions and procedures are available to be used.

## Web Scraping / Data Insertion
Here are the steps to run the web scraping scripts as well as insert the data into the database. Note that the data these web scraping scripts output can be found in the `web-scraping/data/` directory. In addition, each of these web scraping scripts requires `BeautifulSoup` to be installed. If it isn't yet installed, run the command `pip install beautifulsoup4` in a virtual environment.
 * To run `college_scrape.py`, execute the command `python college_scrape.py`
 * To run `building_scraper.py`, execute the command `python building_scraper.py`
   * Note: After running `building_scraper.py`, run `building_cleaner.py` by executing the command `python building_cleaner.py`. Make sure that the path to the input file (`usm_rooms.json`) is specified on `line 7`.
 * To run `study_room_scraper.py`, execute the command `python study_room_scraper.py`
 * To run `data_validation.py`, first ensure that the `INPUT_JSON` variable has the path to the desired JSON file, then execute the command `python data_validation.py`.
### Data Insertion
To insert data into the database, complete the steps listed below. It is important to complete them in the order specified here to ensure that foreign key references between entities are kept intact.
 * To insert the data on American colleges, navigate to MySQLWorkbench's `Schemas` panel on the left-hand side and right click the `university` entity. Then, select `Table Data Import Wizard`. From there, specify the path to `US_Colleges.json` and complete the import process.
 * To insert the data on USM buildings and classrooms, run `insert_rooms.py` by executing the command `python insert_rooms.py`. Before you run the file, you must edit lines `4` and `14` to specify the path of the input file (`rooms_clean.json`) and your MySQLWorkbench root password. This password is needed for Python to connect to MySQL, and is set when creating the initial connection to the database in MySQLWorkbench.
 * To insert the data on USM library study rooms, run `insert_study_rooms.py` by executing the command `python insert_study_rooms.py`. Like with `insert_rooms.py`, make sure you specify the input path of the file as well as the MySQLWorkbench root user password.


## Phase 2 Task Delegation

 * Schema Implementation
   * Task Supervisor: Ben - GitHub username: bennyyy51
   * Due Date: November 6, 2025
   * Subtasks:
     * Creation of Campus Location Entity w/ constraints
       * Ben
     * Creation of University / Campuses entities
       * Ben
     * Creation of Rating Entity w/ constraints
       * Ahmad
     * Creation of Logged_in_User and Rating_Equipment / Rating_Accessibility Entities w/ constraints
       * Ben
       * Nathaniel
 * Stored Procedures & Functions
   * Task Supervisor: Ahmad - GitHub username: AhmadMouhsen
   * Due Date: November 9, 2025
   * Subtasks:
     * Compile list of Procedures & Functions to implement
       * Ahmad
     * Implementation of procedures & functions
       * Ahmad
       * Nathaniel
     * Query optimization
       * Ben
 * Web Scraping / Data Normalization
   * Task Supervisor: Nathaniel - GitHub username: nathanielSerrano
   * Due Date: November 11, 2025
   * Subtasks:
     * Scrape for buildings / rooms on USM campuses
       * Nathaniel
     * Scrape for American Colleges
       * Ben
     * Data normalization
       * Ben
       * Nathaniel
     * Inserting data into DB
       * Nathaniel
 * Video
   * Task Supervisor: Nathaniel
   * Each member records and goes over the task they supervised.
   * Due Date: November 14, 2025









