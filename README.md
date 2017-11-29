# Mastodon simple bot

あらかじめ設定されたトゥートをランダムに取得し、投稿するだけのbotです。

# 使い方

とりあえずお約束。  
事前にnodejsとnpmを入れておいてください。

```console
$ git clone https://github.com/wd-shiroma/mastodon-simple-bot.git
$ cd mastodon-simple-bot
$ npm install
```

`./config` ディレクトリ内の `default.json.sample` から `.sample` 拡張子を取り除き、ファイルを編集してください。  
application内の3つを修正すれば大丈夫かと思います。

```json
{
    "application": {
        "domain": "example.com", //インスタンスのドメイン
        "access_token": "",      //アクセストークン(マストドンにログインし、設定→開発から取得できます)
        "visibility": "direct"   //公開範囲(public/unlisted/private/direct)
    },
    "path": {
        "posts": "./posts",      //トゥート格納ディレクトリ
        "media": "./media"       //メディア格納ディレクトリ
    }
}
```

トゥート内容は `./post` 内に作成してください。  
ファイル名は `(数値)_(ハイフンまたは英数字).json` をひっかけてます。

数値：重みづけ(大きい方が選ばれやすくなる)  
ハイフンまたは英数字：任意文字列。何でもいいです。

./post/xx_statusname.json.sampleを参考にするといいです。

```json
{
    "spoiler_text": "contents warning...", //CWメッセージ、不要の場合はこの項目を削除
    "status": "toot message...",           //トゥート内容
    "sensitive": false,                    //NSFWを付ける場合はtrueにする
    "visibility": "direct",                //投稿範囲(未指定の場合はdefault.jsonで指定した値が入ります)
    "media_files": [                       //添付画像(最大４ファイル、mediaディレクトリに格納したファイル名)
        "image1.png",
        "image2.png",
        "image3.png",
        "image4.png"
    ]
}
```

ファイル内のJSON内容がそのままPOSTされます。詳しくは[マストドン公式のAPIドキュメント](https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#posting-a-new-status)も参照してみてください。

コンフィグファイル、postsディレクトリの修正が完了したら、ファイルが正しいかチェックしてみてください。

```console
$ node check_posts.js
-------------- configuration
invalid visibility ←エラーがあった場合表示されます。
done.
-------------- posts
checking: ./posts/100_cw.json
No media file: noimage.png ←メディアファイルが無かった場合は表示されます。
checking: ./posts/100_nnaa.json
checking: ./posts/100_nsfw.json
checking: ./posts/100_tootname.json
checking: ./posts/100_tootpost.json
```

エラーが出なくなったら実際に動かしてみます。

```console
$ node main.js
posting: tootpost
success.
```

successが出たら投稿成功です。

あとはcronで回すなりして定期トゥートできるようにするといいかもしれないです。
