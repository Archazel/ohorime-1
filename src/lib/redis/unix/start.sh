echo "Build redis"

cd ./src/lib/redis/unix

tar xzf redis-6.0.9.tar.gz

cd redis-6.0.9

make

src/redis-server