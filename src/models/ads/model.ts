import bcrypt from 'bcrypt';

let adsFunctions = {
    create_table: (mysql: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ads (
                ad_id INT AUTO_INCREMENT PRIMARY KEY,
                ads_publisher_id INT NOT NULL,
                images JSON DEFAULT NULL,
                videos JSON DEFAULT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                advertisement_url VARCHAR(2083) NOT NULL,
                unique_code CHAR(12) NOT NULL UNIQUE DEFAULT (SUBSTRING(MD5(RAND()), 1, 12)),
                last_payment_date TIMESTAMP DEFAULT NULL,
                created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                next_payment_date TIMESTAMP DEFAULT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                target_location VARCHAR(255) NOT NULL,
                target_age VARCHAR(50) DEFAULT NULL,
                target_views INT DEFAULT 0,
                target_clicks INT DEFAULT 0,
                other_properties JSON DEFAULT NULL,
                FOREIGN KEY (ads_publisher_id) REFERENCES users(id)
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

    insert_ad: (mysql: any, adData: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const checkUserQuery = `SELECT id FROM users WHERE id = ?`;

            mysql.query(checkUserQuery, [adData.ads_publisher_id], (err: Error, results: any) => {
                if (err) {
                    console.error('Error checking ads publisher ID:', err);
                    return reject(new Error('Error checking ads publisher ID'));
                }

                if (results.length === 0) {
                    return reject(new Error('Invalid ads_publisher_id, User does not exist'));
                }

                const insertAdQuery = `
                INSERT INTO ads (
                    ads_publisher_id, images, videos, title, description, advertisement_url, 
                    last_payment_date, next_payment_date, amount, target_location, target_age, 
                    target_views, target_clicks, other_properties
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

                const values = [
                    adData.ads_publisher_id,
                    JSON.stringify(adData.images) || null,
                    JSON.stringify(adData.videos) || null,
                    adData.title,
                    adData.description,
                    adData.advertisement_url,
                    adData.last_payment_date || null,
                    adData.next_payment_date || null,
                    adData.amount,
                    adData.target_location,
                    adData.target_age || null,
                    adData.target_views || 0,
                    adData.target_clicks || 0,
                    JSON.stringify(adData.other_properties) || null
                ];

                mysql.query(insertAdQuery, values, (err: Error, results: any) => {
                    if (err) {
                        console.error('Error inserting ad:', err);
                        return reject(new Error('Error inserting ad'));
                    }
                    resolve(results);
                });
            });
        });
    }
};

export default adsFunctions;