import crypto from 'crypto';

let secretFunctions = {
    create_table: (mysql: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`;

            mysql.query(createTableQuery, (err: Error) => {
                if (err) {
                    console.error('Error ensuring table exists:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    },

    generate_verification_link: (
        mysql: any,
        email: string,
        baseURL: string
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const token = crypto.randomBytes(32).toString('hex');

            const saveTokenQuery = `
            INSERT INTO verification_tokens (email, token, created_at) 
            VALUES (?, ?, NOW());`;

            mysql.query(saveTokenQuery, [email, token], (err: Error) => {
                if (err) {
                    console.error('Error saving verification token:', err);
                    return reject(err);
                }

                const verificationLink = `${baseURL}/verify?token=${token}`;

                setTimeout(() => {
                    const deleteTokenQuery = `
                    DELETE FROM verification_tokens 
                    WHERE token = ?;`;

                    mysql.query(deleteTokenQuery, [token], (deleteErr: Error) => {
                        if (deleteErr) {
                            console.error('Error deleting expired token:', deleteErr);
                        } else {
                            console.log('Expired token deleted successfully');
                        }
                    });
                }, 6 * 60 * 1000);

                resolve(verificationLink);
            });
        });
    },

    delete_verification_entry: (
        mysql: any,
        identifier: string
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const deleteQuery = `
            DELETE FROM verification_tokens 
            WHERE email = ? OR token = ?;`;

            mysql.query(deleteQuery, [identifier, identifier], (err: Error) => {
                if (err) {
                    console.error('Error deleting verification entry:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    },

    verify_and_fetch_user: (
        mysql: any,
        token: string
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            const fetchTokenQuery = `
            SELECT email 
            FROM verification_tokens 
            WHERE token = ?;`;

            mysql.query(fetchTokenQuery, [token], (err: Error, results: any[]) => {
                if (err) {
                    console.error('Error fetching token data:', err);
                    return reject(err);
                }

                if (results.length === 0) {
                    return reject(new Error('Token not found or expired'));
                }

                const email = results[0].email;

                const deleteTokenQuery = `
                DELETE FROM verification_tokens 
                WHERE token = ?;`;

                mysql.query(deleteTokenQuery, [token], (deleteErr: Error) => {
                    if (deleteErr) {
                        console.error('Error deleting token:', deleteErr);
                        return reject(deleteErr);
                    }

                    console.log('Token deleted successfully');

                    const fetchUserQuery = `
                    SELECT * 
                    FROM users 
                    WHERE email = ?;`;

                    mysql.query(fetchUserQuery, [email], (userErr: Error, userResults: any[]) => {
                        if (userErr) {
                            console.error('Error fetching user data:', userErr);
                            return reject(userErr);
                        }

                        if (userResults.length === 0) {
                            return reject(new Error('User not found'));
                        }

                        resolve(userResults[0]);
                    });
                });
            });
        });
    }
};

export default secretFunctions;
