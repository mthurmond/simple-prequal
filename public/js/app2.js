// define constants
const validClass = 'is-valid'
const invalidClass = 'is-invalid'
const minPurchasePrice = 100_000
const maxPurchasePrice = 4_000_000
const minLoan = 50_000
const minDown = 0.03

// create value class and objects
class PrequalValue {
    constructor(type, elementId) {
        this.type = type
        this.elementId = elementId
    }
    element() {
        return document.getElementById(`${this.elementId}`)
    }
    hiddenInput() {
        return document.getElementById(`${this.elementId}-hidden`)
    }
    userInput() {
        return parseInt(this.element().value)
    }
    updateValue(formula) {
        this.element().innerHTML = String(formula)
    }
    updateHiddenValue(formula) {
        this.hiddenInput().value = String(formula)
    }
    getCalculatedValue() {
        return parseInt(this.hiddenInput().value)
    }
    checkValidation(isValid) {
        this.element().classList.remove(validClass, invalidClass)
        this.element().classList.add((isValid) ? validClass : invalidClass)
    }
}

const purchasePrice = new PrequalValue('manual', 'purchase-price')
const downPayment = new PrequalValue('manual', 'down-payment')
const loanAmount = new PrequalValue('calculated', 'loan-amount')

// update values and validation based on user inputs
const prequalForm = document.getElementById('prequal');
prequalForm.addEventListener('focusout', function (event) {
    // update calculated variables
    
    loanAmount.updateValue(purchasePrice.userInput() - downPayment.userInput())
    loanAmount.updateHiddenValue(purchasePrice.userInput() - downPayment.userInput())
    
    purchasePrice.checkValidation(
        purchasePrice.userInput() >= minPurchasePrice &&
        purchasePrice.userInput() <= maxPurchasePrice
    )

    downPayment.checkValidation(
        downPayment.userInput() >= (minDown * purchasePrice.userInput()) &&
        loanAmount.getCalculatedValue() >= minLoan &&
        purchasePrice.userInput()
    )
})