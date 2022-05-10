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
        dpPercent: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "dp-percent" value', 
                },
                notEmpty: {
                    msg: 'please provide a "dp-percent" value', 
                },   
            },
        }, 
        loanAmount: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "loanAmount" value', 
                },
                notEmpty: {
                    msg: 'please provide a "loanAmount" value', 
                },   
            },
        },  
        monthlyIncome: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "monthly-income" value', 
                },
                notEmpty: {
                    msg: 'please provide a "monthly-income" value', 
                },   
            },
        }, 
        monthlyLoanPayment: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "monthlyLoanPayment" value', 
                },
                notEmpty: {
                    msg: 'please provide a "monthlyLoanPayment" value', 
                },   
            },
        },
        otherMonthlyDebt: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "other-monthly-debt" value', 
                },
                notEmpty: {
                    msg: 'please provide a "other-monthly-debt" value', 
                },   
            },
        }, 
        totalMonthlyDebt: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "totalMonthlyDebt" value', 
                },
                notEmpty: {
                    msg: 'please provide a "totalMonthlyDebt" value', 
                },   
            },
        },  
        dti: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "dti" value', 
                },
                notEmpty: {
                    msg: 'please provide a "dti" value', 
                },   
            },
        }, 
        totalAssets: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "total-assets" value', 
                },
                notEmpty: {
                    msg: 'please provide a "total-assets" value', 
                },   
            },
        }, 
        requiredAssets: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "requiredAssets" value', 
                },
                notEmpty: {
                    msg: 'please provide a "requiredAssets" value', 
                },   
            },
        },  
        creditScore: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "credit-score" value', 
                },
                notEmpty: {
                    msg: 'please provide a "credit-score" value', 
                },   
            },
        },  
        dtiQualified: {
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "dtiQualified" value', 
                },
                notEmpty: {
                    msg: 'please provide a "dtiQualified" value', 
                },   
            },
        },  
        creditQualified: {
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "creditQualified" value', 
                },
                notEmpty: {
                    msg: 'please provide a "creditQualified" value', 
                },   
            },
        },  
        assetQualified: {
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "assetQualified" value', 
                },
                notEmpty: {
                    msg: 'please provide a "assetQualified" value', 
                },   
            },
        },  
        prequalified: {
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "prequalified" value', 
                },
                notEmpty: {
                    msg: 'please provide a "prequalified" value', 
                },   
            },
        },  
    }, { 
        sequelize 
    }); 

    return Prequal; 
};