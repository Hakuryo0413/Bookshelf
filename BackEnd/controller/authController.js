const sqlConnection = require("../util/sql.connection");
const bcrypt = require("bcrypt");
const validator = require("validator");

module.exports.Login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(username, password);
        if (!username) {
            return res.status(400).json({ msg: "Invalid Email" });
        }

        // const user = await sqlConnection.query("SELECT * FROM user WHERE usr_name = ?", [username]);
        const user = await new Promise ((resolve, reject) => {
            sqlConnection.query("SELECT * FROM user WHERE usr_name = ?", [username], (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
        // const admin = await sqlConnection.query("SELECT * FROM admin WHERE usr_name = ?", [username]);
        const admin = await new Promise ((resolve, reject) => {
            sqlConnection.query("SELECT * FROM admin WHERE usr_name = ?", [username], (err, result) => {
                if (err) reject(err);
                resolve(result[0]);
            })
        })
        console.log(user, "user");
        console.log(admin, "admin");

        if (user.length === 0 && admin.length === 0) {
            return res.status(400).json({ msg: "User not found" });
        }

        const foundUser = user.length !== 0 ? user[0] : admin[0];
        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Password" });
        }

        return res.status(200).json({
            id: foundUser.id,
            role: user.length !== 0 ? "user" : "admin",
            name: foundUser.fullName,
            email: foundUser.email,
            idPage: 0,
            msg: "Login success"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error.message });
    }
}

module.exports.Register = async (req, res) => {
    try {
        console.log(req.body);
        const { username, fullName, password } = req.body;
        if (!username) {
            return res.status(400).json({ msg: "Please enter your email" });
        }
        if (!fullName) {
            return res.status(400).json({ msg: "Please enter your name" });
        }
        if (!password) {
            return res.status(400).json({ msg: "Please enter your password" });
        }
        const existingUser = await new Promise((resolve, reject) => {
            sqlConnection.query("SELECT * FROM user WHERE usr_name = ?", [username], (error, result) => {
                if (error) {
                    console.error("Error executing SQL query:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
        console.log(existingUser);
        if (existingUser.length > 0) {
            return res.status(400).json({ msg: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await sqlConnection.query("INSERT INTO user (usr_name, fullName, password) VALUES (?, ?, ?)", [username, fullName, hashedPassword]);

        if (result != null) {
            return res.status(200).json({ msg: "Register success" });
        } else {
            return res.status(400).json({ msg: "Register failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error.message });
    }
}  

module.exports.DeleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await new Promise((resolve, reject) => {
            sqlConnection.query("DELETE FROM user WHERE id = ?", [id], (error, result) => {
                if (error) {
                    console.error("Error executing SQL query:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })

        if (result != null) {
            return res.status(200).json({ msg: "Delete success" });
        } else {
            return res.status(400).json({ msg: "Delete failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error.message });
    }
}
