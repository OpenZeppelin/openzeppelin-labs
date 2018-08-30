# Initializer Contracts with arguments

## Context

The previous experiment ([`initializer_contracts`](/initializer_contracts)) demonstrated a way to
store constructors on chain and use them directly, so as to avoid the shortcomings of manually
written initializer functions. The constructors used did not have arguments, and we left that as a
second challenge to be tackled. That is the purpose of this experiment.

## Understanding the challenge

Since transactions have only one data field, it must be used for both code and arguments in the
case of contract creation: arguments must be concatenated after the code, and together are sent as
data. Since during contract creation all transaction data becomes the code of the new contract, the
constructor will read its arguments using `codecopy` (and may also use `codesize`).

Given this, the simple approach of deploying one reusable initializer contract that we used in the
first experiment will not work for arguments. The contract will not have any arguments where the
constructor code expects them, and those specified by the user cannot be placed in the already
deployed code.

## Solution #1: Deploy a new contract

The simplest approach, and one that doesn't involve modifying code, is to redeploy the initializer
contract every time it needs to be used, concatenated with the arguments specific to the instance
that is being created.

This is implemented in [`scripts/poc-2.js`](/scripts/poc-2.js).
