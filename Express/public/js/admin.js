const deleteProduct = async (btn) => {
    try {
        const prodId = btn.parentNode.querySelector('[name=productId]').value;
        const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
        const productElement = btn.closest('article');

        const deleteResult = await fetch(`/admin/product/${prodId}`, {
            method: 'DELETE',
            headers: { 'csrf-token': csrf }
        });
        const data = await deleteResult.json();
        productElement.remove();
    } catch (error) {
        console.log('error in delete product helper method', error);
    }
};
