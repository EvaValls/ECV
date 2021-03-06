function userTokenReceived(data) {
    // TODO: check if there's an error
    if (data.user.token != undefined) {
        console.log(data.user)
        localStorage.setItem("user-token", data.user.token)
        localStorage.setItem("user-name", data.user.username)
        document.location.href = "all-books.html";
    } else {
        error = document.querySelector(".error-message p")
        console.log(error)
        error.innerText = data.user.message
        document.getElementsByClassName("error-message")[0].classList.remove("hidden")
    }

}

function onLoginClicked() {
    if (event.key === 'Enter' || event.key == undefined) {
        var user = document.querySelector("input[name='email']").value;
        var password = document.querySelector("input[name='password']").value;

        this.client.requestLogin(user, password, userTokenReceived)
    }

}

function onLoginButtonClicked() {
    document.querySelector("input[name='email']").value = "";
    document.querySelector("input[name='password']").value = "";
    document.getElementsByClassName("login-title")[0].innerText = "Login";
    document.getElementById("input-username").classList.add("hidden");
    document.getElementById("btn-login").classList.remove("hidden");
    document.getElementById("btn-register").classList.add("hidden");
    document.getElementsByClassName("login-btn-reg")[0].classList.remove("hidden");
    document.getElementsByClassName("login-content")[0].style.height = "40%";
}

function onRegisterClicked() {
    error = document.getElementsByClassName("error-message")[0].classList
    if(!error.contains("hidden")){
        error.add("hidden")   
    }
    
    document.querySelector("input[name='email']").value = "";
    document.querySelector("input[name='password']").value = "";
    document.getElementsByClassName("login-title")[0].innerText = "Register";
    document.getElementById("input-username").classList.remove("hidden");
    document.getElementById("btn-login").classList.add("hidden");
    document.getElementById("btn-register").classList.remove("hidden");
    document.getElementsByClassName("login-btn-reg")[0].classList.add("hidden");
    document.getElementsByClassName("login-content")[0].style.height = "34%";
    document.getElementById("btn-register").addEventListener("click", onSubmitRegister.bind(this), false);
}

function onSubmitRegister() {
    var email = document.querySelector("input[name='email']").value;
    var password = document.querySelector("input[name='password']").value;
    var name = document.querySelector("input[name='username']").value;
    if(name==""){
        error = document.querySelector(".error-message p")
        error.innerText = "Username can not be empty."
        document.getElementsByClassName("error-message")[0].classList.remove("hidden")
    }else{
        if(!document.getElementsByClassName("error-message")[0].classList.contains("hidden")){
            document.getElementsByClassName("error-message")[0].classList.add("hidden")
        }
        this.client.requestRegister(email, password, name, registerCallback);
    }
}

function registerCallback(success) {
    if (!success) {
        alert("Error")
    } else {
        onLoginClicked()
    }
}


function init() {

    //document.getElementsByTagName("body")[0].style.display = "initial";
    document.getElementById("btn-login").addEventListener("click", onLoginClicked.bind(this), false);
    document.getElementsByClassName("login-btn-reg")[0].addEventListener("click", onRegisterClicked.bind(this), false);

    // TESTS
    //this.client.requestBookTree("-L6lyMSYuGWMPe4Kts9X", function(){console.log("Book tree received")});

}

var user_token = localStorage.getItem("user-token")
var user_name = localStorage.getItem("user-name")

if (user_token) {
    document.location.href = "all-books.html";
}

function call() {
    if (this.client.ws.readyState != 1) {
        this.client = new Book_Client(init.bind(this))
    }

}
//document.getElementsByTagName("body")[0].style.display = "none";
this.client = new Book_Client(init.bind(this))
setInterval(call, 1000)