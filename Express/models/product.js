const { Schema, model } = require('mongoose');

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    }
});

module.exports = model('Product', productSchema);

// const { ObjectId } = require('mongodb');
// const { getDb } = require('../util/database');

// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new ObjectId(id) : null;
//         this.userId = userId;
//     }

//     async save() {
//         try {
//             const db = getDb();
//             if (this._id) {
//                 return await db
//                     .collection('products')
//                     .updateOne({ _id: this._id }, { $set: this });
//             } else {
//                 return await db.collection('products').insertOne(this);
//             }
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     static async fetchAll() {
//         try {
//             const db = getDb();
//             return await db.collection('products').find().toArray();
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     static async findById(prodId) {
//         try {
//             const db = getDb();
//             return await db
//                 .collection('products')
//                 .findOne({ _id: new ObjectId(prodId) });
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     static async deleteById(prodId) {
//         try {
//             const db = getDb();
//             return await db
//                 .collection('products')
//                 .deleteOne({ _id: new ObjectId(prodId) });
//         } catch (err) {
//             console.log(err);
//         }
//     }
// }
