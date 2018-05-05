# Initializable with multiple inheritance support

_Test using Initializable library in multiple inheritance scenarios._

The current implementation of initializable fails when used with multiple inheritance, where each parent defines its own initializer, since all parents depend on a single `initialized` flag. Thus, when the first parent is initialized, the second fails to do so.

A way to work around this is for every class to define separate `initialize` and `onInitialize` methods, where `initialize` is public, checks and sets the initialized flag, but delegates all actual logic to `onInitialize`, which is internal. See `contracts/test/Inheritance.sol` for an example.
