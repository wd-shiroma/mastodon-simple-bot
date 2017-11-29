'use strict'

let Mastodon = require('mastodon-api');
let conf = require('config');
let fs = require('fs');

let posts_dir = conf.path.posts;
let media_dir = conf.path.media;

const api = new Mastodon({
    access_token: conf.application.access_token,
    api_url: 'https://' + conf.application.domain + '/api/v1/'
});

const get_post = new Promise(function (resolve, reject) {
    let file_list;
    fs.readdir(posts_dir, function(err, files){
        if (err) {
            reject('read posts error.');
        }
        else {
            let i;
            let file_list = files
            .filter(function(file){
                return fs.statSync(posts_dir + '/' + file).isFile() && /\d+_[a-zA-Z0-9]+\.json$/.test(file);
            })
            .map(function(file) {
                let matches = file.match(/(\d+)_([a-zA-Z0-9]+)\.json$/);
                return {
                    weight: parseInt(matches[1]),
                    alias: matches[2],
                    name: matches[0]
                };
            });

            let max_weight = file_list.reduce((prev, current, i, arr) => {
                current.weight += prev.weight;
                return current;
            }).weight;

            let rnd = Math.floor(Math.random() * max_weight);
            for (i = 0; i < file_list.length; i++) {
                if (rnd < file_list[i].weight) {
                    break;
                }
            }

            resolve(file_list[i]);
        }
    });
});

const post_media = function(media) {
    if(!Array.isArray(media)) {
        media = [ media ];
    }

    let promises = [];
    for (let i = 0; i < media.length && i < 4; i++) {
        promises.push(api.post('media', { file: fs.createReadStream(media_dir + '/' + media[i]) }));
    }

    return Promise.all(promises);
}



get_post
.then(function (file) {
    let post = require(posts_dir + '/' + file.name);
    if (typeof post.visibility === 'undefined') {
        post.visibility = conf.application.visibility;
    }

    console.log('posting: ' + file.alias);

    let result;
    if (typeof post.media_files === 'string' || Array.isArray(post.media_files)) {
        result = post_media(post.media_files)
        .then(function(response) {
            post.media_ids = response.map(function(data) {
                return data.data.id;
            });
            return api.post('statuses', post);
        });
    }
    else {
        result = api.post('statuses', post);
    }
    return result;
})
.then(function(resp) {
    if (resp.resp.statusCode === 200) {
        console.log('success.')
    }
    else {
        console.log('failed...')
        console.log('Code: ' + resp.resp.statusCode);
        console.log('Message: ' + resp.resp.statusMessage);
    }
});
