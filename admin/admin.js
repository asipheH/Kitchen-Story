const API_URL = "http://localhost:3000/api";




const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const loginMessage =
                document.getElementById(
                    "loginMessage"
                );


            loginMessage.textContent =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/admin/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username,
                                password
                            })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    loginMessage.textContent =
                        result.message;

                    loginMessage.style.color =
                        "red";

                    return;
                }


                // Save login session

                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                sessionStorage.setItem(
                    "adminUsername",
                    result.admin.username
                );


                loginMessage.textContent =
                    "Login successful!";


                loginMessage.style.color =
                    "green";


                // Go to dashboard

                setTimeout(function() {

                    window.location.href =
                        "dashboard.html";

                }, 500);


            } catch (error) {

                console.error(error);


                loginMessage.textContent =
                    "Unable to connect to the server.";

                loginMessage.style.color =
                    "red";

            }

        }
    );

}