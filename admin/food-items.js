const API_URL =
    "http://localhost:3000/api/admin";


// Load food items

async function loadFoodItems() {

    const tableBody =
        document.getElementById("foodTableBody");


    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading food items...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/food-items`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load food items."
            );

        }


        const items =
            await response.json();


        displayFoodItems(items);


    } catch (error) {

        console.error(error);


        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load food items.
                </td>
            </tr>
        `;

    }

}


// Display food items

function displayFoodItems(items) {

    const tableBody =
        document.getElementById("foodTableBody");


    tableBody.innerHTML = "";


    if (items.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No food items available.
                </td>
            </tr>
        `;

        return;
    }


    items.forEach(function(item) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${item.id}</td>

            <td>${item.name}</td>

            <td>${item.category}</td>

            <td>
                R${Number(item.price).toFixed(2)}
            </td>

            <td>
                ${
                    item.available
                    ? "Available"
                    : "Not Available"
                }
            </td>

            <td>

                <button
                    onclick="editFoodItem(${item.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteFoodItem(${item.id})"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// Open Add form

function openAddForm() {

    document.getElementById(
        "foodFormContainer"
    ).style.display = "block";


    document.getElementById(
        "formTitle"
    ).textContent = "Add Food Item";


    document.getElementById(
        "foodForm"
    ).reset();


    document.getElementById(
        "foodId"
    ).value = "";

}


// Close form

function closeForm() {

    document.getElementById(
        "foodFormContainer"
    ).style.display = "none";

}


// Save food item

document
    .getElementById("foodForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "foodId"
                ).value;


            const foodItem = {

                name:
                    document.getElementById(
                        "foodName"
                    ).value.trim(),

                category:
                    document.getElementById(
                        "foodCategory"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "foodDescription"
                    ).value.trim(),

                price:
                    Number(
                        document.getElementById(
                            "foodPrice"
                        ).value
                    ),

                available:
                    document.getElementById(
                        "foodAvailability"
                    ).value === "true"

            };


            try {

                let response;


                if (id) {

                    // Update

                    response =
                        await fetch(
                            `${API_URL}/food-items/${id}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(foodItem)
                            }
                        );

                } else {

                    // Add

                    response =
                        await fetch(
                            `${API_URL}/food-items`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(foodItem)
                            }
                        );

                }


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Operation failed."
                    );

                }


                alert(result.message);


                closeForm();


                await loadFoodItems();


            } catch (error) {

                console.error(error);

                alert(error.message);

            }

        }
    );


// Edit food item

async function editFoodItem(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/food-items`
            );


        const items =
            await response.json();


        const item =
            items.find(
                item => item.id === id
            );


        if (!item) {

            alert(
                "Food item not found."
            );

            return;
        }


        document.getElementById(
            "foodFormContainer"
        ).style.display = "block";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Edit Food Item";


        document.getElementById(
            "foodId"
        ).value = item.id;


        document.getElementById(
            "foodName"
        ).value = item.name;


        document.getElementById(
            "foodCategory"
        ).value = item.category;


        document.getElementById(
            "foodDescription"
        ).value =
            item.description;


        document.getElementById(
            "foodPrice"
        ).value = item.price;


        document.getElementById(
            "foodAvailability"
        ).value =
            item.available
            ? "true"
            : "false";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to load food item."
        );

    }

}


// Delete food item

async function deleteFoodItem(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this item?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/food-items/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Delete failed."
            );

        }


        alert(result.message);


        await loadFoodItems();


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// Logout

function logout() {

    sessionStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "login.html";

}


// Protect page

if (
    sessionStorage.getItem("adminLoggedIn")
    !== "true"
) {

    window.location.href =
        "login.html";

}


// Load items

loadFoodItems();