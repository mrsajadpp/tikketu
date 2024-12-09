import bcrypt from 'bcrypt';

let userFunctions = {
    create_table: (mysql: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                verified BOOL NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`;

            mysql.query(createTableQuery, (err: Error, results: any) => {
                if (err) {
                    console.error('Error creating table:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    insert_user: (
        mysql: any,
        name: string,
        email: string,
        password: string
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return reject(err);
                }

                const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
                mysql.query(checkUserQuery, [email], (err: Error, results: any) => {
                    if (err) {
                        console.error('Error checking user existence:', err);
                        return reject(err);
                    }

                    if (results.length > 0) {
                        const existingUser = results[0];
                        if (existingUser.verified) {
                            return reject(new Error('User already registered with this email'));
                        } else {
                            const updateUserQuery = `
                            UPDATE users 
                            SET name = ?, password = ?, verified = false, created_at = NOW() 
                            WHERE email = ?`;

                            mysql.query(updateUserQuery, [name, hashedPassword, email], (updateErr: Error) => {
                                if (updateErr) {
                                    console.error('Error updating user:', updateErr);
                                    return reject(updateErr);
                                }
                                resolve({ message: 'User data updated for unverified account' });
                            });
                        }
                    } else {
                        const insertUserQuery = `
                        INSERT INTO users (name, email, password, verified) 
                        VALUES (?, ?, ?, false)`;

                        mysql.query(insertUserQuery, [name, email, hashedPassword], (insertErr: Error, results: any) => {
                            if (insertErr) {
                                console.error('Error inserting user:', insertErr);
                                return reject(insertErr);
                            }
                            resolve({ message: 'User successfully registered', userId: results.insertId });
                        });
                    }
                });
            });
        });
    },

    update_user: (
        mysql: any,
        id: number,
        updateFields: { name?: string; email?: string; password?: string; verified?: boolean }
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            const fields: string[] = [];
            const values: (string | boolean | number)[] = [];

            if (updateFields.name) {
                fields.push('name = ?');
                values.push(updateFields.name);
            }
            if (updateFields.email) {
                fields.push('email = ?');
                values.push(updateFields.email);
            }
            if (updateFields.password) {
                fields.push('password = ?');
                values.push(updateFields.password);
            }
            if (typeof updateFields.verified === 'boolean') {
                fields.push('verified = ?');
                values.push(updateFields.verified);
            }

            if (fields.length === 0) {
                console.error('No fields provided to update');
                return reject(new Error('No fields provided to update'));
            }

            const updateQuery = `
            UPDATE users 
            SET ${fields.join(', ')} 
            WHERE id = ?;`;

            values.push(id);

            mysql.query(updateQuery, values, (err: Error, results: any) => {
                if (err) {
                    console.error('Error updating user:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    find_user: (mysql: any, id: number): Promise<any> => {
        const findQuery = `
        SELECT * FROM users 
        WHERE id = ?;`;

        return new Promise((resolve, reject) => {
            mysql.query(findQuery, [id], (err: Error, results: any) => {
                if (err) {
                    console.error('Error finding user:', err);
                    return reject(err);
                }
                if (results.length === 0) {
                    console.log('User not found');
                    return resolve(null);
                }
                resolve(results[0]);
            });
        });
    },

    find_all_users: (mysql: any): Promise<any[]> => {
        const findAllQuery = `
        SELECT * FROM users;`;

        return new Promise((resolve, reject) => {
            mysql.query(findAllQuery, (err: Error, results: any) => {
                if (err) {
                    console.error('Error retrieving users:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    },
    find_by_email: (mysql: any, email: string): Promise<any> => {
        const findByEmailQuery = `
        SELECT * FROM users 
        WHERE email = ?;`;

        return new Promise((resolve, reject) => {
            mysql.query(findByEmailQuery, [email], (err: Error, results: any) => {
                if (err) {
                    console.error('Error finding user by email:', err);
                    return reject(err);
                }
                if (results.length === 0) {
                    console.log('User not found with email:', email);
                    return resolve(null);
                }
                resolve(results[0]);
            });
        });
    },

    find_user_by_email_and_password: (mysql: any, email: string, password: string): Promise<any> => {
        const findUserQuery = `
        SELECT * FROM users 
        WHERE email = ?;`;

        return new Promise((resolve, reject) => {
            mysql.query(findUserQuery, [email], (err: Error, results: any) => {
                if (err) {
                    console.error('Error finding user by email:', err);
                    return reject(err);
                }

                if (results.length === 0) {
                    console.log('No user found with the provided email');
                    return reject(new Error('Invalid email or password'));
                }

                const user = results[0];

                bcrypt.compare(password, user.password, (compareErr, isMatch) => {
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                        return reject(compareErr);
                    }

                    if (!isMatch) {
                        console.log('Invalid password');
                        return reject(new Error('Invalid email or password'));
                    }

                    resolve(user);
                });
            });
        });
    }
}

export default userFunctions;