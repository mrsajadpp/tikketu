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
    }
};

export default adsFunctions;