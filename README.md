## Vuepress

### Blog platform admin panel.

### Three parts (Client/Admin/Backend)


### Configure
    Set constants in "backend/.env" to your host,db-host e.t.c
    or open in browser url: "http://youhost/install"

    Make writable folder for images "backend/public/uploads"

    Make writable folder "backend" for apache user
    to configure and write .env file

### Install
    Open in browser url: "http://youhost/install"

#

## Client part 

### Configure
    Set HOST constant "client/src/config/index.js" to your backend host

### Install
    npm install

### Start server localhost:8080/auth
    npm run dev

### Build for production with minification
    npm run build

Files output folder: backend/public/client

#

## Admin panel

### Configure
    Set API_HOST constant "server/src/config/index.js" to your backend host

### Install
    npm install

### Start server localhost:8081/auth
    npm run dev

### Build for production with minification
    npm run build

Files output folder: backend/public/admin

#

## Backend

### Install
    Copy "backend" content folder to your virtual host folder

### Users
    Registered users has all priveleges by default

## Admin access on backend: 
    YOUR_HOST/admin/auth

#

## Used:

[Vue.js] (https://vuejs.org)

[Vue-material] (https://vue-material-old.netlify.com)

[Slim3]
(https://www.slimframework.com)
