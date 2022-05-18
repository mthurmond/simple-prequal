const Sequelize = require('sequelize');

if (process.env.NODE_ENV === 'development') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: true
    });
} else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );
}

const db = {
    sequelize, 
    Sequelize, 
    models: {}, 
}; 

db.models.Post = require('./models/post.js')(sequelize); 
db.models.User = require('./models/user.js')(sequelize); 
db.models.Prequal = require('./models/prequal.js')(sequelize); 
db.models.Prequal2 = require('./models/prequal2.js')(sequelize); 

module.exports = db;