# Initializable with multiple inheritance support

_Test using Initializable library in multiple inheritance scenarios._

The current implementation of initializable fails when used with multiple inheritance, where each parent defines its own initializer, since all parents depend on a single `initialized` flag. Thus, when the first parent is initialized, the second fails to do so.

Since modifiers are inlined we can use the PC to identify each separate initializer, and thus check that each of them is run exactly once. This solves the problem with multiple inheritance, and solves the problem with accidentally running an initializer twice in the contract hierarchy (although not statically as with normal constructors).
