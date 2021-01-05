import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
const host = 'localhost';
const port = 8000;
function extractPath(completePath: string): string[] {
    const folders: string[] = [];
    let currentPath = completePath;
    let currentParent = currentPath;
    do {
        currentPath = currentParent;
        const parent = path.dirname(currentPath);
        const name = path.basename(currentPath);
        folders.push(name);
        currentParent = parent;
    } while (currentParent !== currentPath);
    folders.pop();
    return folders.reverse();
}
function readFile(pathToRead: string[]): Promise<Buffer> {
    const pathConcat = path.resolve('./projects/', ...pathToRead);
    return Promise.resolve().then(() =>
        fs.promises.access(pathConcat).catch(err => {
            throw 'File ' + pathConcat + ' not found!';
        })
    ).then(() =>
        fs.promises.readFile(pathConcat).catch(err => {
            throw 'File ' + pathConcat + ' cannot be read!';
        })
    );
}
function writeFile(pathToWrite: string[], content: string): Promise<void> {
    const pathConcat = path.resolve('./projects/', ...pathToWrite);
    const parent = path.dirname(pathConcat);
    const filename = path.basename(pathConcat);
    return Promise.resolve().then(() =>
        fs.promises.access(pathConcat).catch(err =>
            fs.promises.mkdir(parent, { recursive: true }).catch((err) => {
                throw 'Cannot create parent folder ' + parent;
            })
        )
    ).then(() =>
        fs.promises.writeFile(pathConcat, content).catch(err => {
            throw 'File ' + filename + 'into ' + parent + ' cannot be write!';
        })
    );
}

function list(pathToRead: string[]): Promise<string[]> {
    const pathConcat = path.resolve('./projects/', ...pathToRead);
    return Promise.resolve().then(() =>
        fs.promises.access(pathConcat).catch(err => {
            throw 'Path ' + pathConcat + ' not exists!';
        })
    ).then(() =>
        fs.promises.readdir(pathConcat).catch(err => {
            throw 'Path ' + pathConcat + ' cannot be read!';
        })
    );
}
function readBody(request: http.IncomingMessage): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let body = ''
        request.on('data', (data) => {
            body += data;
        });
        request.on('end', () => {
            resolve(body);
        });
    });
}
function reply(res: http.ServerResponse, httpCode: number, content?: any): void {
    res.writeHead(httpCode, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'text/plain',
    });
    return res.end(content);
}
const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
        const folders = extractPath(req.url);
        if (folders.length === 0) {
            return reply(res, 200, 'Server works!');
        }
        switch (folders.shift()) {
            case 'read':
                readFile(folders).then(result => {
                    return reply(res, 200, result);
                }, (err) => {
                    return reply(res, 500, err);
                });
                break;
            case 'list':
                list(folders).then(result => {
                    return reply(res, 200, JSON.stringify(result));
                }, (err) => {
                    return reply(res, 500, err);
                });
                break;
            case 'write':
                readBody(req).then(body => {
                    writeFile(folders, body).then(() => {
                        return reply(res, 204);
                    }, (err) => {
                        return reply(res, 500, err);
                    });
                }).catch(err => {
                    return reply(res, 500, err);
                });
                break;
            default:
                return reply(res, 400, 'Unsupported method!');
        }
    } catch (e) {
        console.error(e);
        return reply(res, 500, e);
    }
};
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
