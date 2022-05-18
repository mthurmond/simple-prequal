const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
    class Prequal2 extends Sequelize.Model {
        getShortDate() {
            const shortDate = moment(this.createdAt).format('MMMM D, YYYY');
            return shortDate;
        }
    }
    Prequal2.init({
        purchasePrice: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'please provide a "purchase-price" value',
                },
                notEmpty: {
                    msg: 'please provide a "purchase-price" value',
                },
            },
        },
        downPayment: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'please provide a "down-payment" value',
                },
                notEmpty: {
                    msg: 'please provide a "down-payment" value',
                },
            },
        },
        loanAmount: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {},
        },
    }, {
        hooks: {
            beforeCreate: (prequal) => {
                prequal.purchasePrice = prequal.purchasePrice.replace(/,/g, '')
                prequal.downPayment = prequal.downPayment.replace(/,/g, '')
                prequal.loanAmount = prequal.purchasePrice - prequal.downPayment
            }
        },
        sequelize
    });

    return Prequal2;
};