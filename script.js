'use strict';

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2,
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2023-10-30T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT',
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// Date format
const dateFormat = function(date, locale) {
    const calcDaysPassed = function(date1, date2) {
        return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    };
    
    const daysPassed = calcDaysPassed(new Date(), date);
    // console.log(daysPassed);
    if (daysPassed === 0) {
        return "Today";
    }
    else if (daysPassed === 1) {
        return "Yesterday";
    }
    else if (daysPassed <= 7) {
        return `${daysPassed} days ago`;
    }
    
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // const hour = `${date.getHours()}`.padStart(2, 0);
    // const min = `${date.getMinutes()}`.padStart(2, 0);

    // return `${day}/${month}/${year}`;
    const options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    return new Intl.DateTimeFormat(locale, options).format(date);

};

// Currency formatter
const formatCurr = function(value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
};

// Display movements
const displayMovements = function(acc, sort = false) {
    const movements = acc.movements;
    const movementsDates = acc.movementsDates;

    const movs = sort ? movements.slice().sort(function(a, b) {
        return a > b;
    }) : movements;
    containerMovements.innerHTML = '';


    movs.forEach(function(mov, idx) {
        const type = mov > 0 ? "deposit" : "withdrawal";
        const date = new Date(movementsDates[idx]);
        const displayDate = dateFormat(date, acc.locale);

        const formattedMov = formatCurr(mov, acc.locale, acc.currency);
        const html = `
            <div class="movements__row">
            <div class="movements__type movements__type--${type}">${idx + 1} ${type}</div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formattedMov}</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

// Resetting transfer field
const resetTransferMoneyField = function() {
    inputTransferTo.value = inputTransferAmount.value = '';
    inputTransferTo.blur();
    inputTransferAmount.blur();
};

// Resetting login field
const resetLoginField = function() {
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
};

// Resetting close account field
const resetClosingAccountField = function() {
    inputClosePin.value = inputCloseUsername.value = '';
    inputClosePin.blur();
    inputCloseUsername.blur();
};

// Resetting request loan field
const resetRequestLoanField = function() {
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
}

// Updating UI
const updateUI = function() {

    // Display movements
    displayMovements(currentAccount);

    // Display balance
    calcDisplayBalance(currentAccount);

    // Display summary
    calcDisplaySummary(currentAccount);

};


// Creating user names
const createUsernames = function (acc) {
    acc.forEach(function(acc) {
        const lowerUser = acc.owner.toLowerCase().split(' ');
        const uname = lowerUser.map(function(name, idx) {
            return name[0];
        });
        acc.username = uname.join('');
    });
    
}
createUsernames(accounts);

// Display balance
const calcDisplayBalance = function(acc) {
    const movements = acc.movements;
    acc.balance = movements.reduce(function(acc, curr) {
        return acc + curr;
    });
    
    labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};


const calcDisplaySummary = function(acc) {
    const movements = acc.movements;
    const interestRate = acc.interestRate;
    const incomes = movements.filter(function(mov) {
        return mov > 0;
    }).reduce(function(acc, curr) {
        return acc + curr;
    }, 0);
    labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);
    // console.log(`Income: ${incomes}`);

    const out = movements.filter(function(mov) {
        return mov < 0;
    }).reduce(function(acc, curr) {
        return acc + curr;
    }, 0);
    // labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
    labelSumOut.textContent = formatCurr(Math.abs(out), acc.locale, acc.currency);
    // console.log(`Out: ${out}`);

    const interest = movements.filter(function(mov) {
        return mov > 0;
    }).map(function(mov) {
        return (mov * interestRate) / 100;
    }).reduce(function(acc, curr) {
        return acc + (curr >= 1 ? curr : 0); // adding interest of only >= 1;
    }, 0);

    labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
    // console.log(interest);
};


const startLogoutTimer = function() {
    const tick = function() {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;
        
        if (time < 0) {
            labelTimer.textContent = `${"00"}:${"00"}`;
            alert("You have been logged out");
            clearInterval(timer);
            labelWelcome.textContent = 'Login to get started';
            containerApp.style.opacity = 0;
        }
        time -= 1;
    };
    // set time to 6 minutes
    let time = 360;
    tick();
    // call the timer every second
    const timer = setInterval(tick, 1000);
    return timer;
};


let currentAccount, timer;

btnLogin.addEventListener('click', function(e) {

    //Prevent form from submitting
    e.preventDefault();
    
    resetTransferMoneyField();
    currentAccount = accounts.find(function(acc) {
        return acc.username === inputLoginUsername.value;
    });
    if (currentAccount === undefined) {
        labelWelcome.textContent = `Plese enter correct credentials`;
        containerApp.style.opacity = 0;
    }

    else if (currentAccount.pin === Number(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 100;

        // Reset the necessary fields
        resetLoginField();
        resetTransferMoneyField();
        resetClosingAccountField();
        resetRequestLoanField();

        if (timer) {
            clearInterval(timer);
        }
        timer = startLogoutTimer();
        // Update UI
        updateUI();

        const date = new Date();
        const options = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(date);

    }
    else {
        labelWelcome.textContent = `Please enter correct credentials`;
        containerApp.style.opacity = 0;
    }
});

// Transfering money
btnTransfer.addEventListener('click', function(e) {

    e.preventDefault();

    const to = inputTransferTo.value;
    const amount  = Number(inputTransferAmount.value);

    const recieverAcc = accounts.find(function(acc) {
        return acc.username === to;
    });

    if (recieverAcc !== undefined && amount > 0 && amount <= currentAccount.balance && recieverAcc.username !== currentAccount.username) {
        currentAccount.movements.push(-amount);
        recieverAcc.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        recieverAcc.movementsDates.push(new Date().toISOString());
        resetTransferMoneyField();

        // Update UI
        updateUI();
    }

    else {
        alert("Invalid Transfer");
    }

    // reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
});

btnLoan.addEventListener('click', function(e) {
    e.preventDefault();

    // atleast one deposit with 10 % of the loan amount
    const amount = Math.floor(Number(inputLoanAmount.value));

    const approval = currentAccount.movements.some(function(mov) {
        return mov >= (amount * 10) / 100;
    });
    
    if (amount > 0 && approval) {
        setTimeout(function() {
            // console.log("Loan Approved");
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateUI();
        }, 3000);
        
    }
    else {
        setTimeout(function() {
            // console.log("Loan Not Approved");
            alert("Loan not approved. Doesn't fullfill the criteria.")
        }, 3000);
    }

    resetRequestLoanField();
    clearInterval(timer);
    timer = startLogoutTimer();

});

btnClose.addEventListener('click', function(e) {
    e.preventDefault();

    const accountUsername = inputCloseUsername.value;
    const accountPin = Number(inputClosePin.value);

    const closingAccount = accounts.find(function(acc) {
        return acc.username === accountUsername;
    });

    if (currentAccount.pin === accountPin && currentAccount.username === accountUsername) {
        console.log("DELETE");
        const index = accounts.findIndex(function(acc) {
            return acc.username === currentAccount.username;
        });

        // Delete Account
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;
        resetClosingAccountField();
    }
    else {
        alert("Invalid Credentials");
    }
});

let Sort = true;
btnSort.addEventListener('click', function(e) {
    e.preventDefault();

    // console.log(cntSort);
    displayMovements(currentAccount, Sort);
    Sort = !Sort;
    
});
