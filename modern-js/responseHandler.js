//import fs from 'fs';
import { join } from 'path';
import fs from 'fs/promises';

// can be as many as we want
export const resHandler = (req, res, next) => {
    // fs.readFile('my-page.html', 'utf8', (err, data) => {
    //     res.send(data);
    // });

    //need an absolute path
    // __dirname replaced by import.meta.dirname
    //res.sendFile(join(import.meta.dirname, '', 'my-page.html'));

    //promised readFile
    fs.readFile('my-page.html', 'utf8')
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.error(err);
        });
};

// only one export
//export default resHandler;
