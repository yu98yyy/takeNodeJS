# ベースとなるDockerイメージとしてNode.jsの公式イメージを使用
FROM node:16

# コンテナ内の作業ディレクトリを指定
# ここにプロジェクトのファイルがコピーされ、アプリが実行される
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコンテナにコピー
# これにより、依存関係のインストールを効率化
COPY package*.json ./

# npm installを実行して、依存関係をインストール
# Node.jsアプリに必要なモジュールをダウンロード
RUN apt-get update && apt-get install -y python3 make g++
RUN npm rebuild bcrypt --build-from-source

# プロジェクト全体を作業ディレクトリにコピー
COPY . .

# コンテナが外部に公開するポートを指定
# ここではNode.jsのデフォルトポートである3000を公開
EXPOSE 3000

# コンテナ起動時に実行するコマンドを指定
# npm startを実行してアプリケーションを起動
CMD ["npm", "start"]


