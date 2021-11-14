var express = require("express");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var session = require('express-session');
var mysql = require('mysql');
var fs = require('fs');

//Connect to the database
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "lab15",
    port: 3306,
    multipleStatements: true
});

//Test connection
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected!");
});

// configure the port
var port = 8000;

var app = express();

app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(session({
    secret: 'crmorytp8vyp98p%&ADIB66^^&fjdfdfaklfdhf',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 600000}
}));

// set up our templating engine
app.set("view_engine", "ejs");
app.set("views", "templates");

app.listen(port);
console.log("Server running on http://localhost:" + port);

//product information
var users = [
    {
        id: 1,
        username: "Stephen",
        password: "1234",
        passHint: "numbers counting up"
    },
    {
        id: 2,
        username: "Bob",
        password: "ImBob",
        passHint: "My name"
    },
    {
        id: 3,
        username: "Check",
        password: "pw",
        passHint: "Abreviation"
    }
];

var avatar = "images/user.png";
var username = "";
var loggedIn = false;	//Checks that the user has logged in
var pictures = [];	//Used to store previous uploads
var errorType = ""; //Shows which error to display to the user
var correctUser = false;
var passwordHint = "";
var signup = false;	//Used to check if the user has created a new user entry
var imageId;
var canLike = true;


app.get("/", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var sql = "SELECT * FROM images ORDER BY uploadedDate LIMIT 10;";
    var pictures = [];  //This will be used to store the images
    var uploadedId = [];

    //Latest uploads table
    con.query(sql, function (err, results) {
        if (results.length > 0) {    //if there are results within the returned statement
            for (var i = 0; i < results.length; i++) {
                uploadedId.push(results[i].idimages);
                pictures.push("data:image/png;base64," + results[i].imagedata); //Prepare data for display

            }
            response.render("index.ejs", {"sessionUsername": sessionUsername, "results": results, "pictures": pictures, "uploadedId": uploadedId});
        } else {
            response.render("index.ejs", {"sessionUsername": sessionUsername, "results": results, "pictures": pictures, "uploadedId": uploadedId});
        }
    });
});

app.get("/login", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    response.render("login.ejs", {"sessionUsername": sessionUsername, "signup": signup});

});

app.get("/signup", (request, response) => {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    response.render("signup.ejs", {"sessionUsername": sessionUsername});

});

app.get("/images", function (request, response) {

    var sessionUsername = request.session.username;

    var sql = "SELECT * FROM images ORDER BY uploadedDate";
    var pictures = [];  //This will be used to store the images
    var uploadedId = [];

    //Show all images
    con.query(sql, function (err, results) {
        if (results.length > 0) {    //if there are results within the returned statement
            for (var i = 0; i < results.length; i++) {
                uploadedId.push(results[i].idimages);
                pictures.push("data:image/png;base64," + results[i].imagedata); //Prepare data for display

            }
            response.render("images.ejs", {"sessionUsername": sessionUsername, "results": results, "pictures": pictures, "uploadedId": uploadedId});
        } else {
            response.render("images.ejs", {"sessionUsername": sessionUsername, "results": results, "pictures": pictures, "uploadedId": uploadedId});
        }
    });

});

app.get("/upload", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    response.render("upload.ejs", {"sessionUsername": sessionUsername});

});


app.post("/login", function (request, response) {

    //Get username and password from form body
    username = request.body.username;
    var password = request.body.password;
    var sql = "SELECT * FROM users where username = '" + username + "';";
    var errorMessage = "";
    var success = false;

    //If the user's credentials match credentials in the array...
    con.query(sql, function (err, results) {
        if (results[0] == null) {   //If no username matches
            //Wrong username
            errorMessage = "We're sorry but this username cannot be found.";
            correctUser = false;
            return response.json({"errorMessage": errorMessage, "correctUser":correctUser});
        } else if (results[0].username == username && results[0].password == password) { //if username and password match          
            //Set session data
            request.session.username = username;	//Assign cookie data
            request.session.userid = results[0].idusers;
            success = true;
            return response.json({"success": success});

        } else {    //If username matches but password does not match
            //Redirect to error page with login error to display
            correctUser = true;
            passwordHint = results[0].passwordHint;
            errorMessage = "Sorry but your password was incorrect";
            return response.json({"errorMessage": errorMessage, "passwordHint": passwordHint, "correctUser":correctUser});
        }

    });
});

app.post('/signup', (request, response) => {
    //Get username and password from form body
    var username = request.body.username;
    var password = request.body.password;
    var firstName = request.body.firstName;
    var lastName = request.body.lastName;
    var hint = request.body.passHint;
    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var sql = "SELECT * FROM users where username = '" + username + "';";
    var sqlInsert = "INSERT INTO users (username, firstName, lastName, password, passwordHint) VALUES ('" + username + "','" + firstName + "','" + lastName + "','" + password + "','" + hint + "')";
    var errorMessage = "";
    var successMessage = "";

    con.query(sql, function (err, results) {
        if (err)
            throw err;
        //If a match is found, throw error

        if (results[0] != null) {
            errorMessage = "Sorry but this username is already taken.";
            return response.json({"errorMessage": errorMessage, "successMessage": successMessage});
        } else {
            //User does not exist, so proceed with insert
            con.query(sqlInsert, function (err) {
                if (err)
                    throw err;
                successMessage = "Successfully created new user";
                return response.json({"errorMessage": errorMessage, "successMessage": successMessage});
            });

        }
    });
});

app.post("/upload", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var sessionId = request.session.userid;

    //Check that a file has not been selected
    if (!(request.files && request.files.myimage)) {
        //redirect to error page with upload error
        errorType = "upload";
        response.redirect("/error?errorType=" + errorType);
    } else {
        //Prepare the file for upload
        var file = request.files.myimage;
        var filePath = "assets/uploads/" + file.name;       //Image location
        var fileData = file.data;       //Image data
        var fileSize = file.size;   //Get image size
        var imageName = request.body.iname;
        file.mv(filePath);	//Move file into uploads folder
        //convert buffer to base64
        var convert = fileData.toString('base64');
        imageName = escape(imageName);    //Escape special characters
        //get date
        var today = new Date().toISOString().slice(0, 19).replace('T', ' ');

        //Ensure the file isn't above the max size of 1MB
        if (fileSize < 1000000) {
            //Store in DB
            con.query("INSERT INTO images (imagename, imagedata, filePath, uploadedDate, uploadedBy) VALUES ('" + imageName + "','" + convert + "','" + filePath + "','" + today + "','" + sessionId + "')", function (err, result, fields) {
                if (err)
                    throw err;
                //Ensures the user is logged in
                if (sessionUsername) {
                    response.redirect("/profile");
                }
            });
        }

    }
});

//Render for error page
app.get("/error", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var errorType = request.query.errorType;

    response.render("error.ejs", {"errorType": errorType, "correctUser": correctUser, "passwordHint": passwordHint, "sessionUsername": sessionUsername});
});

app.get("/logout", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    request.session.destroy(); //End the current session.
    response.redirect("/");	//Redirect to home page


});

app.get("/profile", function (request, response) {

    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var sql = "SELECT * FROM users LEFT JOIN images ON users.idusers = images.uploadedBy WHERE username = '" + sessionUsername + "';";
    var sqlComments = "SELECT comments.idcomments, comments.commentText, images.imagename from users LEFT JOIN comments ON users.idusers = comments.sentBy LEFT JOIN images ON comments.image = images.idimages WHERE users.username = '" + sessionUsername + "';";
    var userImages = [];    //Used to store all users images
    var imageIDs = [];
    var imageNames = [];
    var comments = [];
    var commentImage = [];
    var commentId = [];

    //Get images
    con.query(sql, function (err, results) {
        if (err)
            throw err;

        //loop through results

        for (var i = 0; i < results.length; i++) {
            if (results[i].imagedata != null) {   //If image has data
                userImages.push("data:image/png;base64," + results[i].imagedata);
                imageIDs.push(results[i].idimages);
                imageNames.push(results[i].imagename);
            }
        }
        //Get Comments
        con.query(sqlComments, function (err, results) {
            if (err)
                throw err;

            for (var i = 0; i < results.length; i++) {
                if (results[i].commentText != null) {
                    comments.push(results[i].commentText);
                    commentImage.push(results[i].imagename);
                    commentId.push(results[i].idcomments);
                }
            }
            response.render("profile.ejs", {"pictures": userImages, "uploadedId": imageIDs, "imageNames": imageNames, "sessionUsername": sessionUsername, "comments": comments, "commentImage": commentImage, "commentId": commentId});
        });
    });
});

//Search Page
app.get("/search", function (request, response) {

    var sessionUsername = request.session.username;

    response.render("search.ejs", {"sessionUsername": sessionUsername});

});

app.get('/image', function (request, response) {
    var sessionUsername = request.session.username;	//Assign cookie data to new variable 

    response.render("image.ejs", {"sessionUsername": sessionUsername});
});

app.get("/image/:id", function (request, response) {
    var sessionUsername = request.session.username;	//Assign cookie data to new variable 
    var sessionId = request.session.userid;
    imageId = request.params.id;     //Get image id from link
    var commentSql = "SELECT comments.commentText, users.username from users LEFT JOIN comments ON users.idusers = comments.sentBy LEFT JOIN images ON comments.image = images.idimages WHERE idimages = " + imageId + ";";
    var userSql = "SELECT * FROM images INNER JOIN users AS U ON images.uploadedBy = U.idusers WHERE idimages = " + imageId + ";";
    var countSql = "SELECT COUNT(*) AS count FROM likes WHERE likedImage = " + imageId + ";";
    var likeSql = "SELECT * FROM likes WHERE likedImage = " + imageId + " AND likedBy = " + sessionId + ";";
    var uploadedBy = "";
    var uploadedDate = "";
    var image = "";
    var imageName = "";
    var comments = [];
    var username = [];
    var likes = 0;

    //Get image
    con.query(commentSql, function (err, results) {
        if (err)
            throw err;
        for (var i = 0; i < results.length; i++) {
            if (results[i].commentText != null) { //if a comment exists
                comments.push(results[i].commentText);
                username.push(results[i].username); //Utilizing two arrays as key could be duplicate               

            }
        }
        //get user info
        con.query(userSql, function (err, results) {

            image = "data:image/png;base64," + results[0].imagedata;    //Get image data from table results
            imageName = results[0].imagename;
            uploadedBy = results[0].username;
            uploadedDate = results[0].uploadedDate;
            //Get image comments and store them in array


            //get likes
            con.query(countSql, function (err, results) {
                if (err)
                    throw err;
                likes = results[0].count;

                //determine whether user can send a like if logged in
                if (sessionId) {
                    con.query(likeSql, function (err, results) {
                        if (err)
                            throw err;

                        if (results.length > 0) {
                            canLike = false;
                            response.render("image.ejs", {"sessionUsername": sessionUsername, "sessionId": sessionId, "imageId": imageId, "uploadedBy": uploadedBy, "uploadedDate": uploadedDate, "image": image, "imageName": imageName, "comments": comments, "username": username, "likes": likes, "canLike": canLike});
                        } else {
                            canLike = true;
                            response.render("image.ejs", {"sessionUsername": sessionUsername, "sessionId": sessionId, "imageId": imageId, "uploadedBy": uploadedBy, "uploadedDate": uploadedDate, "image": image, "imageName": imageName, "comments": comments, "username": username, "likes": likes, "canLike": canLike});
                        }
                    });
                } else {
                    response.render("image.ejs", {"sessionUsername": sessionUsername, "sessionId": sessionId, "imageId": imageId, "uploadedBy": uploadedBy, "uploadedDate": uploadedDate, "image": image, "imageName": imageName, "comments": comments, "username": username, "likes": likes, "canLike": canLike});
                }
            });
        });
    });
});

app.post('/comment', (request, response) => {
    var sessionUsername = request.session.username;	//Assign cookie data to new variable
    var sessionId = request.session.userid;
    var comment = request.body.text;
    var sql = "INSERT INTO comments (commentText, sentBy, image) VALUES ('" + comment + "','" + sessionId + "','" + imageId + "')";


    //Insert comment into table and reload page
    con.query(sql, function (err) {
        if (err)
            throw err;
        return response.json({"username": sessionUsername, "comment": comment});
    });


});

app.post('/like', (request, response) => {
    var sessionUsername = request.session.username;
    var sessionId = request.session.userid;
    var imageId = request.body.id;
    var sql = "SELECT * FROM likes WHERE likedImage = " + imageId + " AND likedBy = " + sessionId + ";";
    var countSql = "SELECT COUNT(*) AS count FROM `lab15`.`likes` WHERE `likedImage` = " + imageId + ";";
    var likes = 0;
    con.query(sql, function (err, results) {
        if (err)
            throw err;
        if (results.length <= 0) {   //determine whether a like has been set by this user

            var sqlUpdate = "INSERT INTO `lab15`.`likes` ( `like`, `likedBy`, `likedImage`) VALUES (" + 1 + "," + sessionId + "," + imageId + ")";
            con.query(sqlUpdate, function (err) {
                if (err)
                    throw err;
                //Count likes
                con.query(countSql, function (err, results) {
                    if (err)
                        throw err;
                    likes = results[0].count;
                    canLike = false;
                    return response.json({"likes": likes, "canLike": canLike});
                });
            });
        } else {
            //Count likes
            con.query(countSql, function (err, results) {
                if (err)
                    throw err;
                canLike = false;
                likes = results[0].count;

                return response.json({"likes": likes, "canLike": canLike});
            });
        }

    });
});

app.post('/deleteComment', (request, response) => {

    var commentId = request.body.id;
    var sql = "DELETE FROM comments WHERE idcomments = " + commentId + ";";
    var deleted = false;

    con.query(sql, function (err) {
        if (err) {
            throw err;
        } else {
            deleted = true;
            return response.json({"deleted": deleted});
        }
    });

});

app.post('/deleteImage', (request, response) => {

    var imageId = request.body.id;
    var sqlSelect = "SELECT filePath FROM images WHERE idimages = " + imageId + ";";
    var sqlDelete = "DELETE FROM images WHERE idimages = " + imageId + ";";
    var sqlKey = "SET foreign_key_checks = 0;";
    var deleted = false;

    con.query(sqlSelect, function (err, result) {
        if (err) {
            throw err;

        } else {
            if (result[0].filePath.length > 0) {
                fs.unlinkSync(result[0].filePath);  //Remove image from uploads folder
            }
            con.query(sqlKey, function (err) {    //Disable foreign key check
                con.query(sqlDelete, function (err) {   //Delete image from DB
                    if (err) {
                        throw err;
                    } else {
                        deleted = true;
                        return response.json({"deleted": deleted});
                    }
                });
            });
        }
    });

});

app.post('/searchData', (request, response) => {

    var term = request.body.text;
    var sql = "SELECT * FROM images WHERE imagename LIKE '%" + term + "%';";
    var found = false;
    con.query(sql, function (err, result) {
        if (err) {
            throw err;
        } else {

            //If something was found
            if (result.length > 0) {
                found = true;
                return response.json({"found": found, "result": result});
            } else {
                found = false;
                return response.json({"found": found});
            }
        }
    });

});

//Function to replace special characters
function escape(stringToEscape){
    if(stringToEscape == '') {
        return stringToEscape;
    }

    return stringToEscape
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a");
}