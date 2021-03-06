var Database = function() {
    this.admin = require("firebase-admin");
    var serviceAccount = require("./firebase.json");

    this.admin.initializeApp({
        credential: this.admin.credential.cert(serviceAccount),
        databaseURL: "https://ecv-p3.firebaseio.com"
    });

    this.db = this.admin.database()
    this.firebase = require("firebase");
    require("firebase/auth");
    require("firebase/database");
    var config = {
        apiKey: "AIzaSyATwv-8E7JI1nPRp23133iUEE3yMYujXCM",
        authDomain: "ecv-p3.firebaseapp.com",
        databaseURL: "https://ecv-p3.firebaseio.com",
        projectId: "ecv-p3",
        storageBucket: "ecv-p3.appspot.com",
        messagingSenderId: "627657737412"
    };
    this.firebase.initializeApp(config);
    this.init()
}

Database.prototype.init = function() {
    /*  this.admin = require("firebase-admin");
      var serviceAccount = require("./firebase.json");

      this.admin.initializeApp({
          credential: this.admin.credential.cert(serviceAccount),
          databaseURL: "https://ecv-p3.firebaseio.com"
      });

      this.db = this.admin.database()
      this.firebase = require("firebase");
      require("firebase/auth");
      require("firebase/database");
      var config = {
          apiKey: "AIzaSyATwv-8E7JI1nPRp23133iUEE3yMYujXCM",
          authDomain: "ecv-p3.firebaseapp.com",
          databaseURL: "https://ecv-p3.firebaseio.com",
          projectId: "ecv-p3",
          storageBucket: "ecv-p3.appspot.com",
          messagingSenderId: "627657737412"
      };
      this.firebase.initializeApp(config);*/
    // console.log(this.firebase.auth())
    this.firebase.auth().onAuthStateChanged(function(user) {

        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

            // ...
        } else {
            // User is signed out.
            // ...
        }
    });


}


Database.prototype.register = function(data) {
    var user = {
        email: data.email,
        password: data.password,
        displayName: data.name,
        disabled: false
    };
    if (data.avatar != undefined) {
        user.photoURL = data.avatar;
    }
    var that = this
    return this.admin.auth().createUser(user)
        .then(function(userRecord) {
            console.log("Successfully created new user:", userRecord.uid);
            /* */
            mail = data.email.replace(".", "")
            var ref = that.db.ref("users/" + mail);
            user = {
                username: data.name,
                avatar: data.avatar != undefined ? data.avatar : null
            }
            return ref.set(user).then(function(user) {
                    return true
                    console.log("Successfully added user ");
                })
                .catch(function(error) {
                    return false
                    console.log("Error adding user: ", error);
                })
        })
        .catch(function(error) {
            console.log("Error creating new user:", error);

            return false
        });

}
Database.prototype.login = function(user) {
    return this.firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(function(data) {
        user = {
            token: data.refreshToken,
            username: data.displayName,
            avatar: data.photoURL
        }
        return user
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
            console.log('Wrong password.');
        } else {
            console.log(errorMessage);
        }
        console.log(error);
        return error
    });

}
Database.prototype.logout = function() {
    return this.firebase.auth().signOut().then(function() {
        console.log("User logout")
        return "success"
    }).catch(function(error) {
        // An error happened.
        return error
    });

}


Database.prototype.editUser = function(data) {
    var user = this.firebase.auth().currentUser;
    /*this.admin.auth().updateUser(uid, data)
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error updating user:", error);
        });*/

    var user = {
        refreshToken: data.token,
        email: data.email
    }
    user.updateProfile({
        displayName: "Pepito",
        photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function() {
        console.log("user updated")
    }).catch(function(error) {
        // An error happened.
    });


}

Database.prototype.deleteUser = function(uid) {
    this.admin.auth().deleteUser(uid)
        .then(function() {
            console.log("Successfully deleted user");
        })
        .catch(function(error) {
            console.log("Error deleting user:", error);
        });
}

Database.prototype.getAllBooks = function() {

    var ref = this.db.ref("books");
    return ref.once("value").then(
        function(book) {
            return book.val();
        }).catch(
        function(errorObject) {
            console.log("The read failed: " + errorObject.code);
            return null;
        }
    );
}
Database.prototype.addBook = function(data) {
    var ref = this.db.ref("books").push();
    data.bookId = ref.key
    return ref.set({
            title: data.title,
            owner_id: data.userId,
            genre: data.genre,
            finished: false,
        }).then(function() {
            console.log("Successfully added book: ", data.bookId);
            return data.bookId

        })
        .catch(function(error) {
            console.log("Error adding book: ", error);
        });
}

Database.prototype.getBook = function(uid) {

    var ref = this.db.ref("books/" + uid);
    return ref.once("value").then(
        function(book) {
            console.log(book.val())
            return book.val();
        },
        function(errorObject) {
            console.log("The read failed: " + errorObject.code);
            return null;
        }
    );
}

Database.prototype.addChapter = function(data) {
    var ref = this.db.ref("chapters").push();
    var that = this;
    data.id = ref.key;
    return ref.set({
            parent_id: data.parentId != undefined ? data.parentId : null,
            title: "",
            decision: data.decision != undefined ? data.decision : null,
            text: "",
            //owner_id: data.userId,
            finished: false,
            is_terminal: false
        }).then(function() {

            var ref2 = that.admin.database().ref("books/" + data.bookId + "/chapters/" + data.id);
            return ref2.set({
                decision: data.decision != undefined ? data.decision : ""
            }).then(function() {
                if (data.parentId != null) {
                    var ref = that.admin.database().ref("chapters/" + data.parentId + "/children/" + data.id)
                    ref.set({
                        decision: data.decision
                    });
                }
                console.log("chapter: " + data.id)
                return data.id
            }).catch(function(error) {
                console.log("error add chapter")
            });

        })
        .catch(function(error) {
            console.log("Error adding chapter:", error);
        });
}
Database.prototype.getChapter = function(chapterId) {

    var ref = this.db.ref("chapters/" + chapterId);
    return ref.once("value").then(
        function(chapter) {
            return chapter.val();
        },
        function(errorObject) {
            console.log("The read failed: " + errorObject.code);
            return null;
        }
    );
}
Database.prototype.getBookChapters = function(bookId) {

    var ref = this.db.ref("books/" + bookId + "/chapters");

    return ref.once("value").then(
        function(chapters) {
            return chapters.val();
        },
        function(errorObject) {
            console.log("Error: " + errorObject.code);
            return null;
        }
    )
}
Database.prototype.updateChapter = function(chapterId, data) {

    this.db.ref("chapters/" + chapterId).update(data)
}

Database.prototype.getBookChaptersStructure = function(bookId) {
    that = this;
    return this.getBookChapters(bookId).then(function(chapter_ids) {
        var ref = that.db.ref("chapters");
        return ref.once("value").then(
            async function(chapter) {
                var total_chapters = chapter.val();

                book_chapters = []
                promises = []
                for (key of Object.keys(chapter_ids)) {
                    book_chapters[key] = total_chapters[key];
                    if (book_chapters[key]["owner_id"]) {
                        result = await that.getUser(book_chapters[key]["owner_id"]);
                        book_chapters[key]["owner_id"] = result["username"];
                    }
                }

                return book_chapters;

            },
            function(errorObject) {
                console.log("The read failed: " + errorObject.code);
                return null;
            }
        );
    });
}

Database.prototype.addComment = function(data) {
    var that = this;
    var ref = this.db.ref("comments/" + data.chapterId).push();
    data.id = ref;
    return ref.set({
            user: data.userId,
            comment: data.comment,
            created: data.created
        }).then(function() {
            console.log("Successfully added comment: ", data.id);
            return data.id

        })
        .catch(function(error) {
            console.log("Error adding comment: ", error);
            return null
        });
}
Database.prototype.getComments = function(data) {

    var ref = this.db.ref("comments/" + data.chapterId);

    return ref.once("value").then(
        function(comments) {
            return comments.val();
        },
        function(errorObject) {
            console.log("Error: " + errorObject.code);
            return null;
        }
    )
}
Database.prototype.getCommentById = function(data) {
    var ref = this.db.ref("comments/" + data.chapterId + "/" + data.commentId);
    return ref.once("value").then(
        function(comment) {
            return comment.val()
        },
        function(errorObject) {
            console.log("Error: " + errorObject.code);
            return null;
        })

}
Database.prototype.deleteComment = function(data) {
    console.log("delete " + data.commentId)

    return this.db.ref("comments/" + data.chapterId + "/" + data.commentId).remove().then(
        function(response) {
            console.log("delete")

            return data.commentId
        },
        function(errorObject) {
            return errorObject
        });
}
Database.prototype.getUser = function(email) {
    var ref = this.db.ref("users/" + email.replace(".", ""))
    return ref.once("value").then(
        function(user) {
            return user.val()
        },
        function(errorObject) {
            console.log("Error: " + errorObject.code);
            return null;
        })
}
Database.prototype.addBookmark =function(data){
    mail = data.email.replace(".", "")
    var ref = this.db.ref("users/" + mail+"/bookmarks/"+ data.bookId);
    book = data.bookId
    chapter = data.chapterId
    bookmark = {
        chapter: chapter
        
    }
    return ref.set(bookmark).then(function(response) {
            return true
            console.log("Successfully bookmark ");
        })
        .catch(function(error) {
            return false
            console.log("Error adding user: ", error);
        })
}
module.exports = Database;