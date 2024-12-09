import crypto from 'crypto';
import bcrypt from 'bcrypt';

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

                    const updateUserQuery = `
                    UPDATE users 
                    SET verified = true 
                    WHERE email = ?;`;

                    mysql.query(updateUserQuery, [email], (updateErr: Error) => {
                        if (updateErr) {
                            console.error('Error updating user data:', updateErr);
                            return reject(updateErr);
                        }

                        console.log('User verified successfully');

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
        });
    },

    generate_password_reset_link: (
        mysql: any,
        email: string,
        baseURL: string
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const checkEmailQuery = `
            SELECT email 
            FROM users 
            WHERE email = ?;`;

            mysql.query(checkEmailQuery, [email], (checkErr: Error, results: any[]) => {
                if (checkErr) {
                    console.error('Error checking email existence:', checkErr);
                    return reject(checkErr);
                }

                if (results.length === 0) {
                    return reject(new Error('Email not found in the database'));
                }

                const token = crypto.randomBytes(32).toString('hex');

                const saveTokenQuery = `
                INSERT INTO verification_tokens (email, token, created_at) 
                VALUES (?, ?, NOW());`;

                mysql.query(saveTokenQuery, [email, token], (saveErr: Error) => {
                    if (saveErr) {
                        console.error('Error saving verification token:', saveErr);
                        return reject(new Error('Error saving verification token'));
                    }

                    const resetLink = `${baseURL}/reset-password?token=${token}`;

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

                    resolve(resetLink);
                });
            });
        });
    },

    validate_and_update_password: (
        mysql: any,
        token: string,
        newPassword: string
    ): Promise<string> => {
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
                        return reject(new Error('Error deleting token'));
                    }

                    console.log('Token deleted successfully');

                    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error('Error hashing password:', err);
                            return reject(new Error('Error hashing password'));
                        }

                        const updatePasswordQuery = `
                        UPDATE users 
                        SET password = ? 
                        WHERE email = ?;`;

                        mysql.query(updatePasswordQuery, [hashedPassword, email], (updateErr: Error) => {
                            if (updateErr) {
                                console.error('Error updating password:', updateErr);
                                return reject(new Error('Error updating password'));
                            }

                            console.log('Password updated successfully');
                            resolve('Password updated successfully');
                        });
                    });
                });
            });
        });
    },
    find_user_by_token: async (mysql: any, token: string): Promise<any> => {
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
    },
};

export default secretFunctions;
