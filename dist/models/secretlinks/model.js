"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
let secretFunctions = {
    create_table: (mysql) => {
        return new Promise((resolve, reject) => {
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`;
            mysql.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error ensuring table exists:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    },
    generate_verification_link: (mysql, email, baseURL) => {
        return new Promise((resolve, reject) => {
            const token = crypto_1.default.randomBytes(32).toString('hex');
            const saveTokenQuery = `
            INSERT INTO verification_tokens (email, token, created_at) 
            VALUES (?, ?, NOW());`;
            mysql.query(saveTokenQuery, [email, token], (err) => {
                if (err) {
                    console.error('Error saving verification token:', err);
                    return reject(err);
                }
                const verificationLink = `${baseURL}/verify?token=${token}`;
                setTimeout(() => {
                    const deleteTokenQuery = `
                    DELETE FROM verification_tokens 
                    WHERE token = ?;`;
                    mysql.query(deleteTokenQuery, [token], (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error deleting expired token:', deleteErr);
                        }
                        else {
                            console.log('Expired token deleted successfully');
                        }
                    });
                }, 6 * 60 * 1000);
                resolve(verificationLink);
            });
        });
    },
    delete_verification_entry: (mysql, identifier) => {
        return new Promise((resolve, reject) => {
            const deleteQuery = `
            DELETE FROM verification_tokens 
            WHERE email = ? OR token = ?;`;
            mysql.query(deleteQuery, [identifier, identifier], (err) => {
                if (err) {
                    console.error('Error deleting verification entry:', err);
                    return reject(err);
                }
                resolve();
            });
        });
    },
    verify_and_fetch_user: (mysql, token) => {
        return new Promise((resolve, reject) => {
            const fetchTokenQuery = `
            SELECT email 
            FROM verification_tokens 
            WHERE token = ?;`;
            mysql.query(fetchTokenQuery, [token], (err, results) => {
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
                mysql.query(deleteTokenQuery, [token], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting token:', deleteErr);
                        return reject(deleteErr);
                    }
                    console.log('Token deleted successfully');
                    const updateUserQuery = `
                    UPDATE users 
                    SET verified = true 
                    WHERE email = ?;`;
                    mysql.query(updateUserQuery, [email], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating user data:', updateErr);
                            return reject(updateErr);
                        }
                        console.log('User verified successfully');
                        const fetchUserQuery = `
                        SELECT * 
                        FROM users 
                        WHERE email = ?;`;
                        mysql.query(fetchUserQuery, [email], (userErr, userResults) => {
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
    generate_password_reset_link: (mysql, email, baseURL) => {
        return new Promise((resolve, reject) => {
            const checkEmailQuery = `
            SELECT email 
            FROM users 
            WHERE email = ?;`;
            mysql.query(checkEmailQuery, [email], (checkErr, results) => {
                if (checkErr) {
                    console.error('Error checking email existence:', checkErr);
                    return reject(checkErr);
                }
                if (results.length === 0) {
                    return reject(new Error('Email not found in the database'));
                }
                const token = crypto_1.default.randomBytes(32).toString('hex');
                const saveTokenQuery = `
                INSERT INTO verification_tokens (email, token, created_at) 
                VALUES (?, ?, NOW());`;
                mysql.query(saveTokenQuery, [email, token], (saveErr) => {
                    if (saveErr) {
                        console.error('Error saving verification token:', saveErr);
                        return reject(new Error('Error saving verification token'));
                    }
                    const resetLink = `${baseURL}/reset-password?token=${token}`;
                    setTimeout(() => {
                        const deleteTokenQuery = `
                        DELETE FROM verification_tokens 
                        WHERE token = ?;`;
                        mysql.query(deleteTokenQuery, [token], (deleteErr) => {
                            if (deleteErr) {
                                console.error('Error deleting expired token:', deleteErr);
                            }
                            else {
                                console.log('Expired token deleted successfully');
                            }
                        });
                    }, 6 * 60 * 1000);
                    resolve(resetLink);
                });
            });
        });
    },
    validate_and_update_password: (mysql, token, newPassword) => {
        return new Promise((resolve, reject) => {
            const fetchTokenQuery = `
            SELECT email 
            FROM verification_tokens 
            WHERE token = ?;`;
            mysql.query(fetchTokenQuery, [token], (err, results) => {
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
                mysql.query(deleteTokenQuery, [token], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting token:', deleteErr);
                        return reject(new Error('Error deleting token'));
                    }
                    console.log('Token deleted successfully');
                    bcrypt_1.default.hash(newPassword, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error('Error hashing password:', err);
                            return reject(new Error('Error hashing password'));
                        }
                        const updatePasswordQuery = `
                        UPDATE users 
                        SET password = ? 
                        WHERE email = ?;`;
                        mysql.query(updatePasswordQuery, [hashedPassword, email], (updateErr) => {
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
    find_user_by_token: (mysql, token) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const fetchTokenQuery = `
            SELECT email 
            FROM verification_tokens 
            WHERE token = ?;`;
            mysql.query(fetchTokenQuery, [token], (err, results) => {
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
                mysql.query(fetchUserQuery, [email], (userErr, userResults) => {
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
    }),
};
exports.default = secretFunctions;
