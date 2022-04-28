var purchasePriceMask = IMask(document.querySelector('#purchase-price'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

var downPaymentMask = IMask(document.querySelector('#down-payment'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

var downPaymentPercentMask = IMask(document.querySelector('#down-payment-percent'), {
	mask: Number,
	min: 0,
	max: 100, 
	scale: 0
});

const minLoan = 50000; 
const minDown = 0.03;

let purchaseInput = document.getElementById('purchase-price');
let dpInput = document.getElementById('down-payment');
let dpPercentInput = document.getElementById('down-payment-percent');

(function () {
	'use strict';
	
	// PURCHASE PRICE
	purchaseInput.addEventListener('blur', function (event) {
		// reset
		purchaseInput.classList.remove('is-invalid')
		purchaseInput.classList.remove('is-valid')

		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const min = parseInt(event.target.min); 
		const max = parseInt(event.target.max); 

		if (!purchasePrice) { return }

		if (purchasePrice < min || purchasePrice > max) {
			purchaseInput.classList.add('is-invalid');
		} else {
			purchaseInput.classList.add('is-valid');
		}

		var event = new Event('blur');
		dpInput.dispatchEvent(event);
		
		calculateDownPaymentPercent(); 
		calculateLoanAmount(); 
	});

	// DOWN PAYMENT
	dpInput.addEventListener('blur', function (event) {
		// reset
		dpInput.classList.remove('is-invalid')
		dpInput.classList.remove('is-valid')
		
		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const downPayment = parseInt(downPaymentMask.unmaskedValue);
		const loanAmount = purchasePrice - downPayment; 

		if (!purchasePrice || !downPayment) { return }

		if (downPayment < (minDown * purchasePrice) || loanAmount < minLoan) {
			dpInput.classList.add('is-invalid');
		} else {
			dpInput.classList.add('is-valid');
		}
		calculateDownPaymentPercent(); 
		calculateLoanAmount(); 
	});

	// DP PERCENT 
	dpPercentInput.addEventListener('blur', function (event) {
		// reset
		dpPercentInput.classList.remove('is-invalid')
		dpPercentInput.classList.remove('is-valid')

		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const downPaymentPercent = parseInt(dpPercentInput.value) / 100; 
		console.log(downPaymentPercent);
		const newDownPayment = Math.round(purchasePrice * downPaymentPercent); 
		
		if (!purchasePrice) { 
			document.getElementById('down-payment-percent').value = '0';
		} else {
			document.getElementById('down-payment').value = newDownPayment.toString();
		}

		var event = new Event('blur');
		dpInput.dispatchEvent(event);
		
		calculateLoanAmount(); 
	});
})();

function calculateLoanAmount() {
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	const loanAmount = purchasePrice - downPayment; 

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedLoanAmount = loanAmount.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );

	if (loanAmount > 0) {
		document.getElementById('loan-amount').innerHTML = `$${formattedLoanAmount}`;
	} else {
		document.getElementById('loan-amount').innerHTML = '';
	}
		
}

function calculateDownPaymentPercent() {
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const downPaymentPercent = Math.round((downPayment / purchasePrice) * 100); 
	console.log(downPaymentPercent); 

	if (!purchasePrice || !downPayment || downPaymentPercent > 100) { 
		document.getElementById('down-payment-percent').value = '0';
	} else {
		document.getElementById('down-payment-percent').value = downPaymentPercent.toString();
	}

}







// TRIX JS FOR LOADING IMAGES - DELETE LATER
(function () {
	var HOST = "https://d13txem1unpe48.cloudfront.net/"

	addEventListener("trix-attachment-add", function (event) {
		if (event.attachment.file) {
			uploadFileAttachment(event.attachment)
		}
	})

	function uploadFileAttachment(attachment) {
		uploadFile(attachment.file, setProgress, setAttributes)

		function setProgress(progress) {
			attachment.setUploadProgress(progress)
		}

		function setAttributes(attributes) {
			attachment.setAttributes(attributes)
		}
	}

	function uploadFile(file, progressCallback, successCallback) {
		var key = createStorageKey(file)
		var formData = createFormData(key, file)
		var xhr = new XMLHttpRequest()

		xhr.open("POST", HOST, true)

		xhr.upload.addEventListener("progress", function (event) {
			var progress = event.loaded / event.total * 100
			progressCallback(progress)
		})

		xhr.addEventListener("load", function (event) {
			if (xhr.status == 204) {
				var attributes = {
					url: HOST + key,
					href: HOST + key + "?content-disposition=attachment"
				}
				successCallback(attributes)
			}
		})

		xhr.send(formData)
	}

	function createStorageKey(file) {
		var date = new Date()
		var day = date.toISOString().slice(0, 10)
		var name = date.getTime() + "-" + file.name
		return ["tmp", day, name].join("/")
	}

	function createFormData(key, file) {
		var data = new FormData()
		data.append("key", key)
		data.append("Content-Type", file.type)
		data.append("file", file)
		return data
	}
})();