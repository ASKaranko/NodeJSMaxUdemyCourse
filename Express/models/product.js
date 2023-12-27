const { getDb } = require('../util/database');

class Product {
    constructor(title, price, description, imageUrl) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    async save() {
        try {
            const db = getDb();
            return await db.collection('products').insertOne(this);
        } catch(err) {
            console.log(err);
        }
    }
}

module.exports = Product;
