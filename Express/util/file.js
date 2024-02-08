const { unlink } = require('fs/promises');

const deleteFile = async (filePath) => {
    await unlink(filePath);
};

exports.deleteFile = deleteFile;