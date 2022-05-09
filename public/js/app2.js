import { pmt } from './finance.js'; 

// ASSIGN CONSTANTS
// for validation
const minPurchasePrice = 100000;
const maxPurchasePrice = 4000000;
const minLoan = 50000; 
const minDown = 0.03;

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
	dpPercent: document.getElementById('dp-percent'),
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
	updateCalculatedVariables();
	checkPrequalStatus(dti, requiredAssets);
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

function updateCalculatedVariables() {
	// recalculate calculated elements 
	loanAmount = inputValue.purchasePrice - inputValue.dp; 
	dpPercent = Math.round((inputValue.dp / inputValue.purchasePrice) * 100); 
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
		document.getElementById('dp-percent').value = '0';
	} else {
		document.getElementById('dp-percent').value = dpPercent.toString();
	}

	// write dti using custom rules
	const formattedDti = `${dti.toString()}%`;
	if (dti > 0) {
		document.getElementById('dti').innerHTML = `${formattedDti}`;
	} else {
		document.getElementById('dti').innerHTML = '';
	}	
};

function updateElementValue(value, element) {
	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedValue = value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
	if (value > 0) {
		element.innerHTML = `$${formattedValue}`;
	} else {
		element.innerHTML = '';
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