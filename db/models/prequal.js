const Sequelize = require('sequelize'); 
const moment = require('moment'); 

module.exports = (sequelize) => {
    class Prequal extends Sequelize.Model {
        getShortDate() {
            const shortDate = moment(this.createdAt).format('MMMM D, YYYY');
            return shortDate; 
        }
    }
    Prequal.init({
        title: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "title" value', 
                },
                notEmpty: {
                    msg: 'please provide a "title" value', 
                },   
            },
        }, 
        body: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: {
                notNull: {
                    msg: 'please provide a "Body" value', 
                },
                notEmpty: {
                    msg: 'please provide a "Body" value', 
                },   
             }, 
        }, 
        status: {
            type: Sequelize.STRING, 
            allowNull: true, 
        }, 
    }, { 
        sequelize 
    }); 

    return Prequal; 
};