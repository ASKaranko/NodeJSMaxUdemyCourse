const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ]
    }
});

userSchema.methods.addToCart = async function (product) {
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
            productId: product._id,
            quantity
        });
    }

    const updatedCart = {
        items: updatedCartItems
    };

    this.cart = updatedCart;
    await this.save();
};

userSchema.methods.deleteFromCart = async function (prodId) {
    try {
        this.cart.items = this.cart.items.filter(
            (cp) => cp.productId.toString() !== prodId.toString()
        );
        await this.save();
    } catch (err) {
        console.log(err);
    }
};

userSchema.methods.clearCart = async function () {
    try {
        this.cart = { items: [] };
        await this.save();
    } catch (err) {
        console.log(err);
    }
};

module.exports = model('User', userSchema);
