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
        user: { name: string; email: string; password: string }
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            const insertQuery = `
            INSERT INTO users (name, email, password) 
            VALUES (?, ?, ?);`;

            mysql.query(insertQuery, [user.name, user.email, user.password], (err: Error, results: any) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return reject(err);
                }
                resolve(results);
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
}

export default userFunctions;