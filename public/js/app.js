import { pmt } from './finance.js'; 

// ASSIGN CONSTANTS
// for validation
const minPurchasePrice = 100000;
const maxPurchasePrice = 4000000;
const minLoan = 50000; 
const minDown = 0.03;
const minPossibleFico = 300;
const maxPossibleFico = 850; 

// for prequal decision
const minFico = 600; 
const maxDti = 43;

// CREATE POINTERS TO ELEMENTS
const inputElement = {
	purchasePrice: document.getElementById('purchase-price'),
	dp: document.getElementById('down-payment'),
	dpPercent: document.getElementById('dp-percent'),
	otherMonthlyDebt: document.getElementById('other-monthly-debt'),
	totalMonthlyIncome: document.getElementById('monthly-income'),
	totalAssets: document.getElementById('total-assets'),
	creditScore: document.getElementById('credit-score') 
}

const calculatedElement = {
	loanAmount: document.getElementById('loan-amount'),
	monthlyLoanPayment: document.getElementById('monthly-loan-payment'),
	totalMonthlyDebt: document.getElementById('total-monthly-debt'),
	dti: document.getElementById('dti'),	
	requiredAssets: document.getElementById('required-assets')	
}

const prequalForm = document.getElementById('prequal');

// ADD MASKS TO ELEMENTS --> 

// create mask types
const maskType = {
	number: {
		mask: Number,
		min: 0,
		max: 9999999999,
		thousandsSeparator: ','
	}, 
	percent: {
		mask: Number,
		min: 0,
		max: 100, 
		scale: 0
	}, 
	credit: {
		mask: Number,
		min: 0,
		max: 999
	}
};

// add masks
const inputMask = {
	purchasePrice: IMask(inputElement.purchasePrice, maskType.number),
	dp: IMask(inputElement.dp, maskType.number),
	dpPercent: IMask(inputElement.dpPercent, maskType.percent),
	otherMonthlyDebt: IMask(inputElement.otherMonthlyDebt, maskType.number),
	totalMonthlyIncome: IMask(inputElement.totalMonthlyIncome, maskType.number),
	totalAssets: IMask(inputElement.totalAssets, maskType.number),
	creditScore: IMask(inputElement.creditScore, maskType.credit)
}

// FUNCTIONS --> 

// declare global variables used in fuctions
let inputValue; 

// update calculated elements and prequal status if input elements change
prequalForm.addEventListener('focusout', function (event) {	
	getUserInputs();
	updateCalculatedVariables(event);
	checkPrequalStatus(dti, requiredAssets);
	checkValidation();
});

// get latest user input values
function getUserInputs() {
	inputValue = {
		purchasePrice: parseInt(inputMask.purchasePrice.unmaskedValue),
		dp: parseInt(inputMask.dp.unmaskedValue),
		dpPercent: parseInt(inputMask.dpPercent.unmaskedValue),
		otherMonthlyDebt: parseInt(inputMask.otherMonthlyDebt.unmaskedValue),
		totalMonthlyIncome: parseInt(inputMask.totalMonthlyIncome.unmaskedValue),
		totalAssets: parseInt(inputMask.totalAssets.unmaskedValue),
		creditScore: parseInt(inputMask.creditScore.unmaskedValue) 
	}
}

// declare calculated variables so they persist and can be used by other fuctions
// will save these to database later
let loanAmount, dpPercent, monthlyLoanPayment, totalMonthlyDebt, dti, requiredAssets; 

function updateCalculatedVariables(event) {
	// recalculate calculated elements 
	// if user updated dp percent, set dp % to new value and update dp. if not, use formula.
	if (event.target == inputElement.dpPercent) {
		dpPercent = inputValue.dpPercent; 
		inputElement.dpPercent.value = dpPercent; 
		updateDownPayment(); 
	} else {
		dpPercent = Math.round((inputValue.dp / inputValue.purchasePrice) * 100); 	
	}
	loanAmount = inputValue.purchasePrice - inputValue.dp; 
	monthlyLoanPayment = Math.round(-pmt(0.05/12, 360, loanAmount));
	totalMonthlyDebt = Math.round(inputValue.otherMonthlyDebt + monthlyLoanPayment); 
	dti = Math.round(((totalMonthlyDebt / inputValue.totalMonthlyIncome) * 100)); 
	requiredAssets = Math.round(inputValue.dp + (inputValue.purchasePrice * 0.03));

	updateElementValue(loanAmount, calculatedElement.loanAmount); 
	updateElementValue(monthlyLoanPayment, calculatedElement.monthlyLoanPayment); 
	updateElementValue(totalMonthlyDebt, calculatedElement.totalMonthlyDebt);
	updateElementValue(requiredAssets, calculatedElement.requiredAssets); 

	// write dp percent using custom rules
	if (!inputValue.purchasePrice || !inputValue.dp || dpPercent > 100) { 
		inputElement.dpPercent.value = '0';
	} else {
		inputElement.dpPercent.value = dpPercent.toString();
	}

	// write dti using custom rules
	const formattedDti = `${dti.toString()}%`;
	if (dti > 0) {
		calculatedElement.dti.innerHTML = `${formattedDti}`;
	} else {
		calculatedElement.dti.innerHTML = '';
	}	
};

// update down payment when user enters dp percent value
function updateDownPayment() {
	inputValue.dp = (dpPercent / 100) * inputValue.purchasePrice; 
	inputElement.dp.value = inputValue.dp.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
}

function updateElementValue(value, element) {
	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedValue = value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
	if (value > 0) {
		element.innerHTML = `$${formattedValue}`;
	} else {
		element.innerHTML = '';
	}
}

function checkValidation() {
	removeValidationClasses(inputElement.purchasePrice, inputElement.dp, inputElement.creditScore); 

	// purchase price
	if (inputValue.purchasePrice) {
		if (inputValue.purchasePrice < minPurchasePrice || inputValue.purchasePrice > maxPurchasePrice) {
			inputElement.purchasePrice.classList.add('is-invalid');
		} else {
			inputElement.purchasePrice.classList.add('is-valid');
		}
	}
	// down payment
	console.log(inputValue.purchasePrice, inputValue.dp, minDown, loanAmount, minLoan)
	if (inputValue.purchasePrice && inputValue.dp) {
		if (inputValue.dp < (minDown * inputValue.purchasePrice) || loanAmount < minLoan) {
			inputElement.dp.classList.add('is-invalid');
		} else {
			inputElement.dp.classList.add('is-valid');
		}
	}
	// credit score
	if (inputValue.creditScore) {
		if (inputValue.creditScore < minPossibleFico || inputValue.creditScore > maxPossibleFico) {
			inputElement.creditScore.classList.add('is-invalid');
		} else {
			inputElement.creditScore.classList.add('is-valid');
		}
	}
}

function removeValidationClasses() {
	for (let i = 0, j = arguments.length; i < j; i++) {
		arguments[i].classList.remove('is-invalid', 'is-valid');
	}
}

function checkPrequalStatus(dti, requiredAssets) {
	const dtiQualified = (dti <= maxDti) ? true:false; 
	const creditQualified = (inputValue.creditScore >= minFico) ? true:false; 
	const assetQualified = (inputValue.totalAssets >= requiredAssets) ? true:false; 

	// const prequalStatus = 
	let dtiMessage = (dtiQualified) ? 'DTI qualifies':'DTI is too high'; 
	let creditMessage = (creditQualified) ? 'Credit qualifies':'Credit is too low';
	let assetsMessage = (assetQualified) ? 'Assets qualify':'Assets are too low'; 

	const prequalifiedDecision = (dtiQualified && creditQualified && assetQualified) ? 'Congratulations, you are pre-qualified!':'Unfotunately, you are not pre-qualified at this time.'; 

	document.getElementById('prequal-check').innerHTML = prequalifiedDecision;
	document.getElementById('prequal-details').innerHTML = `${dtiMessage}, ${creditMessage}, ${assetsMessage}.`;
}