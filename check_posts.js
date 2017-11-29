'use strict'

console.log('-------------- configuration');
let conf, fs;
try{
    conf = require('config');
    fs = require('fs');
}
catch(e) {
    console.log('import error!');
    process.exit();
}

if (conf.application.domain === 'example.com') {
    console.error('\'example.com\' is invalid domain');
}
else if(!/([A-Za-z0-9][A-Za-z0-9\-]{1,61}[A-Za-z0-9]\.)+[A-Za-z]+/.test(conf.application.domain)) {
    console.error('invalid domain');
}

if (conf.application.access_token.length !== 64) {
    console.error('invalid access_token');
}

if (!/^(public|unlisted|private|direct)$/.test(conf.application.visibility)) {
    console.error('invalid visibility')
}

console.log('done.');

let posts_dir = conf.path.posts;
let media_dir = conf.path.media;

let file_list;

console.log('-------------- posts');
fs.readdir(posts_dir, function(err, files){
    if (err) throw err;
    else {
        let i;
        let file_list = files
        .filter(function(file){
            return fs.statSync(posts_dir + '/' + file).isFile() && /\d+_[a-zA-Z0-9]+\.json$/.test(file);
        })
        .forEach(function(file, i, arr) {
            console.log('checking: ' + posts_dir + '/' + file)
            try {
                let post = require(posts_dir + '/' + file);
                if (!post.status) {
                    console.error('post status is not found');
                }
                if (post.media_files) {
                    post.media_files.forEach(function(m,j,r) {
                        try {
                            fs.statSync(media_dir + '/' + m);
                        }
                        catch (e) {
                            console.error('No media file: ' + m);
                        }
                    })
                }
            }
            catch(e) {
                console.error('Parse error!');
                console.log(e);
            }
        });

    }
});