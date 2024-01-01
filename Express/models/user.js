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

    async getCart() {
        try {
            const productsIds = this.cart.items.map((item) => item.productId);
            const db = getDb();
            const products = await db
                .collection('products')
                .find({ _id: { $in: productsIds } })
                .toArray();
            return products.map((p) => {
                return {
                    ...p,
                    quantity: this.cart.items.find((cp) =>
                        cp.productId.equals(p._id)
                    ).quantity
                };
            });
        } catch (err) {
            console.log(err);
        }
    }

    async addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex((cp) =>
            cp.productId.equals(product._id)
        );

        let quantity = 1;
        const updatedCartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            quantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = quantity;
        } else {
            updatedCartItems.push({
                productId: new ObjectId(product._id),
                quantity
            });
        }

        const updatedCart = {
            items: updatedCartItems
        };
        const db = getDb();
        await db
            .collection('users')
            .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    async deleteFromCart(prodId) {
        try {
            const db = getDb();
            await db.collection('users').updateOne(
                { _id: this._id },
                {
                    $set: {
                        cart: {
                            items: this.cart.items.filter(
                                (cp) =>
                                    cp.productId.toString() !==
                                    prodId.toString()
                            )
                        }
                    }
                }
            );
        } catch (err) {
            console.log(err);
        }
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
