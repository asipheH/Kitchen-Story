const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());


// Middleware

app.use(cors());

app.use(express.json());


// Test API

app.get("/", function(req, res) {

    res.json({
        message: "Kitchen Story API is running"
    });

});


// ===============================
// CUSTOMER FOOD APIs
// ===============================


// Get available food items

app.get("/api/food-items", function(req, res) {

    const sql = `
        SELECT
            id,
            name,
            category,
            description,
            price,
            available
        FROM food_items
        WHERE available = TRUE
        ORDER BY name
    `;


    db.query(sql, function(error, results) {

        if (error) {

            console.error(
                "Database error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve food items."
            });

        }


        res.json(results);

    });

});


// Search food items

app.get(
    "/api/food-items/search",
    function(req, res) {

        const search =
            req.query.q || "";


        const searchTerm =
            `%${search}%`;


        const sql = `
            SELECT
                id,
                name,
                category,
                description,
                price,
                available
            FROM food_items
            WHERE available = TRUE
            AND (
                name LIKE ?
                OR category LIKE ?
            )
            ORDER BY name
        `;


        db.query(
            sql,
            [searchTerm, searchTerm],
            function(error, results) {

                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Search failed."
                    });

                }


                res.json(results);

            }
        );

    }
);


// ===============================
// ADMIN FOOD APIs
// ===============================


// Get ALL food items

app.get(
    "/api/admin/food-items",
    function(req, res) {

        const sql = `
            SELECT
                id,
                name,
                category,
                description,
                price,
                available
            FROM food_items
            ORDER BY id
        `;


        db.query(
            sql,
            function(error, results) {

                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to retrieve food items."
                    });

                }


                res.json(results);

            }
        );

    }
);


// Add food item

app.post(
    "/api/admin/food-items",
    function(req, res) {

        const {
            name,
            category,
            description,
            price,
            available
        } = req.body;


        if (
            !name ||
            !category ||
            price === undefined
        ) {

            return res.status(400).json({
                message:
                    "Name, category and price are required."
            });

        }


        const sql = `
            INSERT INTO food_items
            (
                name,
                category,
                description,
                price,
                available
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                name,
                category,
                description || "",
                price,
                available !== false
            ],
            function(error, result) {

                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to add food item."
                    });

                }


                res.status(201).json({

                    message:
                        "Food item added successfully.",

                    id:
                        result.insertId

                });

            }
        );

    }
);


// Update food item

app.put(
    "/api/admin/food-items/:id",
    function(req, res) {

        const id =
            Number(req.params.id);


        const {
            name,
            category,
            description,
            price,
            available
        } = req.body;


        if (
            !name ||
            !category ||
            price === undefined
        ) {

            return res.status(400).json({
                message:
                    "Name, category and price are required."
            });

        }


        const sql = `
            UPDATE food_items

            SET
                name = ?,
                category = ?,
                description = ?,
                price = ?,
                available = ?

            WHERE id = ?
        `;


        db.query(
            sql,
            [
                name,
                category,
                description || "",
                price,
                available !== false,
                id
            ],
            function(error, result) {

                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update food item."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Food item not found."
                    });

                }


                res.json({
                    message:
                        "Food item updated successfully."
                });

            }
        );

    }
);


// Delete food item

app.delete(
    "/api/admin/food-items/:id",
    function(req, res) {

        const id =
            Number(req.params.id);


        const sql = `
            DELETE FROM food_items
            WHERE id = ?
        `;


        db.query(
            sql,
            [id],
            function(error, result) {

                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );

                    return res.status(500).json({
                        message:
                            "Failed to delete food item."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        message:
                            "Food item not found."
                    });

                }


                res.json({
                    message:
                        "Food item deleted successfully."
                });

            }
        );

    }
);

app.post("/api/admin/login", function(req, res) {

    const {
        username,
        password
    } = req.body;


    if (!username || !password) {

        return res.status(400).json({
            message:
                "Username and password are required."
        });

    }


    const sql = `
        SELECT
            id,
            username,
            password
        FROM admins
        WHERE username = ?
        LIMIT 1
    `;


    db.query(
        sql,
        [username],
        async function(error, results) {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    message: "Login failed."
                });

            }


            if (results.length === 0) {

                return res.status(401).json({
                    message:
                        "Invalid username or password."
                });

            }


            const admin = results[0];


            try {

                const passwordMatches =
                    await bcrypt.compare(
                        password,
                        admin.password
                    );


                if (!passwordMatches) {

                    return res.status(401).json({
                        message:
                            "Invalid username or password."
                    });

                }


                res.json({

                    message:
                        "Login successful.",

                    admin: {
                        id: admin.id,
                        username: admin.username
                    }

                });


            } catch (error) {

                console.error(error);

                res.status(500).json({
                    message:
                        "Password verification failed."
                });

            }

        }
    );

});

// ===============================
// ORDER API
// ===============================

app.post("/api/orders", function(req, res) {

    const {
        customerName,
        email,
        items
    } = req.body;


    // Validate request

    if (
        !customerName ||
        !email ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return res.status(400).json({
            message:
                "Customer details and order items are required."
        });

    }


    // Get the food item IDs

    const itemIds =
        items.map(item => Number(item.foodItemId));


    const placeholders =
        itemIds.map(() => "?").join(",");


    const sql = `
        SELECT
            id,
            name,
            price,
            available
        FROM food_items
        WHERE id IN (${placeholders})
    `;


    db.query(
        sql,
        itemIds,
        function(error, foodItems) {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    message:
                        "Unable to retrieve food items."
                });

            }


            // Check that every requested item exists

            if (
                foodItems.length !== itemIds.length
            ) {

                return res.status(400).json({
                    message:
                        "One or more food items do not exist."
                });

            }


            // Create order details

            let totalAmount = 0;

            const orderItems = [];


            for (const requestedItem of items) {

                const foodItem =
                    foodItems.find(
                        item =>
                            item.id ===
                            Number(
                                requestedItem.foodItemId
                            )
                    );


                if (!foodItem) {

                    return res.status(400).json({
                        message:
                            "Food item not found."
                    });

                }


                if (!foodItem.available) {

                    return res.status(400).json({
                        message:
                            `${foodItem.name} is not available.`
                    });

                }


                const quantity =
                    Number(
                        requestedItem.quantity
                    );


                if (
                    !Number.isInteger(quantity) ||
                    quantity < 1
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid item quantity."
                    });

                }


                const price =
                    Number(foodItem.price);


                const itemTotal =
                    price * quantity;


                totalAmount += itemTotal;


                orderItems.push({

                    foodItemId:
                        foodItem.id,

                    quantity,

                    price

                });

            }


            // Create the order

            const orderSql = `
                INSERT INTO orders
                (
                    customer_name,
                    email,
                    total_amount,
                    payment_status
                )
                VALUES (?, ?, ?, ?)
            `;


            db.query(
                orderSql,
                [
                    customerName,
                    email,
                    totalAmount,
                    "Pending"
                ],
                function(
                    orderError,
                    orderResult
                ) {

                    if (orderError) {

                        console.error(
                            orderError
                        );

                        return res.status(500).json({
                            message:
                                "Unable to create order."
                        });

                    }


                    const orderId =
                        orderResult.insertId;


                    // Insert order items

                    const itemSql = `
                        INSERT INTO order_items
                        (
                            order_id,
                            food_item_id,
                            quantity,
                            price
                        )
                        VALUES ?
                    `;


                    const values =
                        orderItems.map(item => [

                            orderId,

                            item.foodItemId,

                            item.quantity,

                            item.price

                        ]);


                    db.query(
                        itemSql,
                        [values],
                        function(
                            itemError
                        ) {

                            if (itemError) {

                                console.error(
                                    itemError
                                );

                                return res.status(500).json({
                                    message:
                                        "Unable to save order items."
                                });

                            }


                            res.status(201).json({

                                message:
                                    "Order created successfully.",

                                orderId,

                                totalAmount:

                                    Number(
                                        totalAmount
                                    ).toFixed(2)

                            });

                        }
                    );

                }
            );

        }
    );

});

// ===============================
// PAYMENT API
// ===============================

app.post(
    "/api/payments",
    function(req, res) {

        const {
            orderId,
            paymentMethod
        } = req.body;


        if (!orderId || !paymentMethod) {

            return res.status(400).json({
                message:
                    "Order ID and payment method are required."
            });

        }


        // Get order

        const orderSql = `
            SELECT
                id,
                total_amount,
                payment_status
            FROM orders
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            orderSql,
            [orderId],
            function(
                orderError,
                orders
            ) {

                if (orderError) {

                    console.error(orderError);

                    return res.status(500).json({
                        message:
                            "Unable to retrieve order."
                    });

                }


                if (orders.length === 0) {

                    return res.status(404).json({
                        message:
                            "Order not found."
                    });

                }


                const order =
                    orders[0];


                if (
                    order.payment_status ===
                    "Paid"
                ) {

                    return res.status(400).json({
                        message:
                            "This order has already been paid."
                    });

                }


                const amount =
                    Number(order.total_amount);


                // Create a simulated transaction ID

                const transactionId =
                    "TXN-" +
                    Date.now();


                // Insert payment

                const paymentSql = `
                    INSERT INTO payments
                    (
                        order_id,
                        amount,
                        payment_method,
                        payment_status,
                        transaction_id
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;


                db.query(
                    paymentSql,
                    [
                        order.id,
                        amount,
                        paymentMethod,
                        "Successful",
                        transactionId
                    ],
                    function(
                        paymentError
                    ) {

                        if (paymentError) {

                            console.error(
                                paymentError
                            );

                            return res.status(500).json({
                                message:
                                    "Payment could not be processed."
                            });

                        }


                        // Update order status

                        const updateOrderSql = `
                            UPDATE orders

                            SET payment_status = ?

                            WHERE id = ?
                        `;


                        db.query(
                            updateOrderSql,
                            [
                                "Paid",
                                order.id
                            ],
                            function(
                                updateError
                            ) {

                                if (updateError) {

                                    console.error(
                                        updateError
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Payment recorded but order status could not be updated."
                                    });

                                }


                                res.json({

                                    message:
                                        "Payment successful.",

                                    orderId:
                                        order.id,

                                    amount:
                                        amount.toFixed(2),

                                    transactionId

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);

// ===============================
// GET ORDER DETAILS
// ===============================

app.get(
    "/api/orders/:id",
    function(req, res) {

        const orderId =
            Number(req.params.id);


        const orderSql = `
            SELECT
                id,
                customer_name,
                email,
                total_amount,
                payment_status,
                order_date
            FROM orders
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            orderSql,
            [orderId],
            function(
                orderError,
                orders
            ) {

                if (orderError) {

                    console.error(
                        orderError
                    );

                    return res.status(500).json({
                        message:
                            "Unable to retrieve order."
                    });

                }


                if (orders.length === 0) {

                    return res.status(404).json({
                        message:
                            "Order not found."
                    });

                }


                const order =
                    orders[0];


                const itemsSql = `
                    SELECT
                        oi.quantity,
                        oi.price,
                        f.name
                    FROM order_items oi

                    INNER JOIN food_items f
                        ON oi.food_item_id = f.id

                    WHERE oi.order_id = ?
                `;


                db.query(
                    itemsSql,
                    [orderId],
                    function(
                        itemsError,
                        items
                    ) {

                        if (itemsError) {

                            console.error(
                                itemsError
                            );

                            return res.status(500).json({
                                message:
                                    "Unable to retrieve order items."
                            });

                        }


                        res.json({

                            order,

                            items

                        });

                    }
                );

            }
        );

    }
);

// ===============================
// ADMIN ORDERS API
// ===============================

app.get(
    "/api/admin/orders",
    function(req, res) {

        const sql = `
            SELECT
                id,
                customer_name,
                email,
                total_amount,
                payment_status,
                order_date
            FROM orders
            ORDER BY id DESC
        `;


        db.query(
            sql,
            function(error, results) {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Unable to retrieve orders."
                    });

                }


                res.json(results);

            }
        );

    }
);

app.get(
    "/api/admin/orders/:id",
    function(req, res) {

        const orderId =
            Number(req.params.id);


        if (!Number.isInteger(orderId)) {

            return res.status(400).json({
                message:
                    "Invalid order ID."
            });

        }


        const orderSql = `
            SELECT
                id,
                customer_name,
                email,
                total_amount,
                payment_status,
                order_date
            FROM orders
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            orderSql,
            [orderId],
            function(
                orderError,
                orders
            ) {

                if (orderError) {

                    console.error(
                        orderError
                    );

                    return res.status(500).json({
                        message:
                            "Unable to retrieve order."
                    });

                }


                if (orders.length === 0) {

                    return res.status(404).json({
                        message:
                            "Order not found."
                    });

                }


                const order =
                    orders[0];


                const itemsSql = `
                    SELECT
                        oi.id,
                        oi.food_item_id,
                        oi.quantity,
                        oi.price,
                        f.name
                    FROM order_items oi

                    INNER JOIN food_items f
                        ON oi.food_item_id = f.id

                    WHERE oi.order_id = ?
                `;


                db.query(
                    itemsSql,
                    [orderId],
                    function(
                        itemsError,
                        items
                    ) {

                        if (itemsError) {

                            console.error(
                                itemsError
                            );

                            return res.status(500).json({
                                message:
                                    "Unable to retrieve order items."
                            });

                        }


                        const paymentSql = `
                            SELECT
                                id,
                                amount,
                                payment_method,
                                payment_status,
                                transaction_id,
                                payment_date
                            FROM payments
                            WHERE order_id = ?
                            ORDER BY id DESC
                            LIMIT 1
                        `;


                        db.query(
                            paymentSql,
                            [orderId],
                            function(
                                paymentError,
                                payments
                            ) {

                                if (paymentError) {

                                    console.error(
                                        paymentError
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Unable to retrieve payment."
                                    });

                                }


                                res.json({

                                    order,

                                    items,

                                    payment:
                                        payments.length > 0
                                            ? payments[0]
                                            : null

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);

// ===============================
// ADMIN DASHBOARD STATISTICS
// ===============================

app.get(
    "/api/admin/dashboard",
    function(req, res) {

        const sql = `
            SELECT

                (
                    SELECT COUNT(*)
                    FROM food_items
                ) AS total_food_items,

                (
                    SELECT COUNT(*)
                    FROM food_items
                    WHERE available = 1
                ) AS available_food_items,

                (
                    SELECT COUNT(*)
                    FROM orders
                ) AS total_orders,

                (
                    SELECT COUNT(*)
                    FROM orders
                    WHERE payment_status = 'Paid'
                ) AS paid_orders,

                (
                    SELECT COALESCE(
                        SUM(total_amount),
                        0
                    )
                    FROM orders
                    WHERE payment_status = 'Paid'
                ) AS total_sales
        `;


        db.query(
            sql,
            function(error, results) {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Unable to load dashboard statistics."
                    });

                }


                res.json(results[0]);

            }
        );

    }
);

// ===============================
// ADMIN CHANGE PASSWORD
// ===============================

app.put(
    "/api/admin/change-password",
    async function(req, res) {

        const {
            username,
            currentPassword,
            newPassword
        } = req.body;


        if (
            !username ||
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({
                message:
                    "All password fields are required."
            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                message:
                    "New password must be at least 6 characters."
            });

        }


        const sql = `
            SELECT
                id,
                username,
                password
            FROM admins
            WHERE username = ?
            LIMIT 1
        `;


        db.query(
            sql,
            [username],
            async function(error, results) {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Unable to verify admin."
                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({
                        message:
                            "Admin account not found."
                    });

                }


                const admin =
                    results[0];


                try {

                    const passwordMatches =
                        await bcrypt.compare(
                            currentPassword,
                            admin.password
                        );


                    if (!passwordMatches) {

                        return res.status(401).json({
                            message:
                                "Current password is incorrect."
                        });

                    }


                    const newHash =
                        await bcrypt.hash(
                            newPassword,
                            10
                        );


                    const updateSql = `
                        UPDATE admins
                        SET password = ?
                        WHERE id = ?
                    `;


                    db.query(
                        updateSql,
                        [
                            newHash,
                            admin.id
                        ],
                        function(
                            updateError
                        ) {

                            if (updateError) {

                                console.error(
                                    updateError
                                );

                                return res.status(500).json({
                                    message:
                                        "Unable to update password."
                                });

                            }


                            res.json({

                                message:
                                    "Password changed successfully."

                            });

                        }
                    );


                } catch (error) {

                    console.error(error);

                    res.status(500).json({
                        message:
                            "Password update failed."
                    });

                }

            }
        );

    }
);
// ===============================
// START SERVER
// ===============================

app.listen(
    PORT,
    function() {

        console.log(
            `Kitchen Story API running on port ${PORT}`
        );

    }
);