// define constants
const validClass = 'is-valid'
const invalidClass = 'is-invalid'
const minPurchasePrice = 100000
const maxPurchasePrice = 4000000
const minLoan = 50_000
const minDown = 0.03

// create value class and objects
class PrequalValue {
  constructor(entryType, elementId) {
    this.entryType = entryType, 
    this.elementId = elementId
  }
  inputElement() {
    return document.getElementById(`${this.elementId}`)
  }
  nonInputElement() {
    return document.getElementById(`${this.elementId}`)
  }
  userInputValue() {
    return parseInt(this.inputElement().value)
  }
  hiddenInputElement() {
    return document.getElementById(`${this.elementId}-hidden`)
  }
  updateHiddenValue(n) {
    this.hiddenInputElement().value = String(n)
  }
  updateCalculatedValue(n) {
    this.nonInputElement().innerHTML = String(n)
  }
  getCalculatedValue() {
    return parseInt(this.hiddenInputElement().value)
  }
  checkValidation(isValid) {
    this.inputElement().classList.remove(validClass, invalidClass)
    this.inputElement().classList.add((isValid) ? validClass : invalidClass)
  }
}

const purchasePrice = new PrequalValue('manual', 'purchase-price')
const downPayment = new PrequalValue('manual', 'down-payment')
const loanAmount = new PrequalValue('calculated', 'loan-amount')

// update values and validation based on user inputs
const prequalForm = document.getElementById('prequal')
prequalForm.addEventListener('focusout', function () {
  // update calculated variables

  loanAmount.updateCalculatedValue(purchasePrice.userInputValue() - downPayment.userInputValue())
  loanAmount.updateHiddenValue(purchasePrice.userInputValue() - downPayment.userInputValue())

  purchasePrice.checkValidation(
    purchasePrice.userInputValue() >= minPurchasePrice &&
    purchasePrice.userInputValue() <= maxPurchasePrice
  )

  downPayment.checkValidation(
    downPayment.userInputValue() >= (minDown * purchasePrice.userInputValue()) &&
    loanAmount.getCalculatedValue() >= minLoan &&
    purchasePrice.userInputValue() !== null
  )
})