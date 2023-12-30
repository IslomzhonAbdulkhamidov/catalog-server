// const mongoDBURI = 'mongodb+srv://prod:HelloWorld@cluster0-en0rc.mongodb.net/katalog?retryWrites=true';

// const mongoDBURI = 'mongodb+srv://user1:user123@cluster0.vgdqi.mongodb.net/catalog?retryWrites=true&w=majority'
const mongoDBURI = 'mongodb://user1:user123@cluster0-shard-00-00.vgdqi.mongodb.net:27017,cluster0-shard-00-01.vgdqi.mongodb.net:27017,cluster0-shard-00-02.vgdqi.mongodb.net:27017/catalog?ssl=true&replicaSet=atlas-y15vm5-shard-0&authSource=admin&retryWrites=true&w=majority'
module.exports = {
  mongoDBURI
};