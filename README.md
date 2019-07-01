# Liquidate the Loans!

## Installation 
1. Navigate to the target directory in the terminal and run the following command `https://github.com/atrivedi1/get_liquidatable_loan_algo.git`
2. In the `getLiqidatableLoans` folder, run:
  - `npm install`
  - `npm run test`

## Implementation
As it pertains to my v1 implementation of the `getLiquidatableLoans` function, there are a few things worth calling out: 

1. I assumed that the data provided was merely sample data, and that the implementation of `getLiquidatableLoans` would ultimately need to handle:
 - Much larger data sets
 - Defaulted Loans
 
2. I assumed that the data in the `loans.json` and `eth-prices.json` files would always be sorted in decesending order. 

3. Given #1 and #2, I decided to leverage a binary search algorithm twice in my implementation: first, to identify the price of ETH at a given point in time; and second, to determine which loans, if any, are in default (based on the given time)

## Test

To validate my implementation I added an additional loan object to the end of `loans.json` with a `filledAt` value ~90 days before the first timestamp in `eth-prices.json` and created the following tests:

1. Confirm that the `getLiquidatableLoans` function returns an array of length 7 with the given sample input: 1558650159442

2. Confirm that the `getLiquidatableLoans` function returns an array of length 8 when the given time input is equal to the FIRST timestamp in the `eth-prices.json` file - meaning that the result should include a defaulted loan

3. Confirm that the `getLiquidatableLoans` function returns an array of length 7 when the given time input is equal to the LAST timestamp in the that the `getLiquidatableLoans` function returns an array of length 7 file (to ensure that the binary search functionality works at the extremes of the provided dataset)

4. Confirm that that the `getLiquidatableLoans` function returns an empty array when the given time input is OUTSIDE of the date range in the `eth-prices.json` file. 


## Outstanding Items

If I had more time, I would refector my binary search implementation to address:

1. Readability - for v1, I abstracted out the binary search logic such that I can leverage it to both find defaulted loans AND the price of ETH at a given point in time. However in doing so, the code is a little harder to reason about. 

2. Conciseness - Right now I have some verbose MVP logic to handle edge cases (see note on line 84 of `getLiquidatableLoans/main.js`). 



