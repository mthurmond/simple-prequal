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
            type: Sequelize.DECIMAL(12, 0),
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
            type: Sequelize.DECIMAL(12, 0),
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
            type: Sequelize.DECIMAL(12, 0),
            allowNull: true,
            validate: {},
        },
    }, {
        hooks: {
            beforeCreate: (prequal) => {
                prequal.purchasePrice = parseInt(prequal.purchasePrice.replace(/,/g, ''))
                prequal.downPayment = parseInt(prequal.downPayment.replace(/,/g, ''))
                prequal.loanAmount = parseInt(prequal.purchasePrice - prequal.downPayment)
            }
        },
        sequelize
    });

    return Prequal2;
};