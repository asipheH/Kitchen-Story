const API_URL =
    "http://localhost:3000/api";



const searchForm =
    document.getElementById("searchForm");


const searchInput =
    document.getElementById("searchInput");


const searchResults =
    document.getElementById("searchResults");



searchForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const searchTerm =
            searchInput.value.trim();


        if (searchTerm === "") {

            searchResults.innerHTML =
                "<p>Please enter a food item.</p>";

            return;
        }


        searchResults.innerHTML =
            "<p>Searching...</p>";


        try {

            const response =
                await fetch(
                    `${API_URL}/food-items/search?q=${encodeURIComponent(searchTerm)}`
                );


            if (!response.ok) {

                throw new Error(
                    "Search request failed."
                );

            }


            const results =
                await response.json();


            displayResults(results);


        } catch (error) {

            console.error(error);


            searchResults.innerHTML = `
                <p>
                    Unable to connect to the server.
                    Please try again.
                </p>
            `;

        }

    }
);



function displayResults(results) {

    if (results.length === 0) {

        searchResults.innerHTML = `
            <h3>Search Results</h3>
            <p>No available food items found.</p>
        `;

        return;
    }


    searchResults.innerHTML = `

        <h3>Available Food Items</h3>

        <div class="food-container">

            ${results.map(function(item) {

                return `

                    <div class="food-card">

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            ${item.description}
                        </p>

                        <p>
                            <strong>
                                Category:
                            </strong>

                            ${item.category}
                        </p>

                        <p class="price">
                            R${Number(item.price).toFixed(2)}
                        </p>

                        <button
                            onclick="selectItem(${item.id})"
                        >
                            Buy Now
                        </button>

                    </div>

                `;

            }).join("")}

        </div>
    `;
}



async function selectItem(itemId) {

    try {

        const response =
            await fetch(
                `${API_URL}/food-items`
            );


        const items =
            await response.json();


        const selectedItem =
            items.find(
                item => item.id === itemId
            );


        if (!selectedItem) {

            alert(
                "Food item could not be found."
            );

            return;
        }


        localStorage.setItem(
            "selectedItem",
            JSON.stringify(selectedItem)
        );


        window.location.href =
            "order.html";


    } catch (error) {

        console.error(error);

        alert(
            "Unable to select the food item."
        );

    }

}