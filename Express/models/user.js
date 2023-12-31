const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this._id = id ? new ObjectId(id) : null;
        this.cart = cart;
    }

    async save() {
        try {
            const db = getDb();
            if (this._id) {
                return await db
                    .collection('users')
                    .updateOne({ _id: this._id }, { $set: this });
            } else {
                return await db.collection('users').insertOne(this);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async addToCart(product) {
        // const isProductInCart = this.cart.items.some(
        //     (cp) => cp._id === product._id
        // );
        const updatedCart = {
            items: [{ productId: new ObjectId(product._id), quantity: 1 }]
        };
        const db = getDb();
        await db
            .collection('users')
            .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    static async findById(userId) {
        try {
            const db = getDb();
            return await db
                .collection('users')
                .findOne({ _id: new ObjectId(userId) });
        } catch (err) {
            console.log(err);
        }
    }

    static async findByName(name) {
        try {
            const db = getDb();
            return await db.collection('users').findOne({ name });
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = User;
