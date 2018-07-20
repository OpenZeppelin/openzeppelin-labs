# Initializer contracts with Solidity editing

This is an alternative implementation for initializer contracts. While the experiment on `initializer_contracts` works at the bytecode level, this one attempts to achieve the same results by modifying the Solidity source code.

The goal is, given a contract:
- Change its constructor into an `initializer` function
- Repeat for all of its ancestors, manually invoking the initializers from the base classes
- Split the contract into an initializer version, that contains only the initializer (and any internal functions needed), and an implementation version, without the initializer

Implementation-wise, the idea is to work with the AST, and use the source locations to perform changes directly to the original text, using primitives similar to the [source-code-fixer from Solium](https://github.com/duaraghav8/Solium/tree/master/lib/autofix).

The upside here is that we don't depend that the compiler outputs bytecode with a certain format, gives us more flexibility for the changes we want to implement, and we know that all contracts can be verified (since they are generated from valid Solidity). 

The downside is that rewriting the source for all recursive dependencies can be cumbersome, and we end up more tied to Solidity as a language (though the bytecode version also depends on the output of the Solidity compiler, as other compilers may generate incompatible bytecode).