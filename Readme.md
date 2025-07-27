Node.js backend Project setup : -
    Create folder and command "nom init -y" or In vscode "npm init (project name)"
    Add in package.json file "type":"modules" and "dev": nodemon src/index.js
    Readme.md
    Git setup
    Create public/temp/.gitkeep and src file and folders
    Create .gitignore file and update same file with "gitignore generator"
    Create .env file
Push all data on github
    Create folders in src folder : controllers, db, middlewares, models, route and utils
    Create files in src folder : app.js, constants.js and index.js
    Install prettier with -D (devDependencies)
    Create files .prettierrc & .prettierignore and add some code

------------------ Complete project setup -------------------------

db1234

cluster setting
    Add New database
db name add in constatnts.db file

Database connection
    Database name add in constants.js
    connectDB with try catch
    Index.js connectDB with promise(try catch)

Install cookieParser and cors and import in app.js

Use cors, cookie-parser, json, urlencoded, static in app.js as middlewares

Update utils folder with error and response file
    asyncHandler.js for wrapper to database queries
    apiError.js for error handling
    apiResponse for success handling

Create User and Video model
    Use bcrypt for exncrypt password as well decrypt also
    User jwt token ACCESS and REFRESH keys

Install multer & Cloudinary
    multer middleware code



