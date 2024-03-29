const path = require('path');
const { unlink } = require('node:fs/promises');

const clearImage = async (filePath) => {
    try {
        filePath = path.join(__dirname, '..', filePath);
        await unlink(filePath);
    } catch (error) {
        console.log('🚀 ~ clearImage ~ error:', error);
    }
};

exports.clearImage = clearImage;