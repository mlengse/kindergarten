# Kindergarten API Documentation

## 1. Introduction

Kindergarten helps you to separate your business logic into modules and add a security layer over them. It is based on sandbox pattern. Kindergarten will work well with all frameworks and libraries you like: VueJS, React, Angular, Ember, Backbone etc. etc. etc...

### Terms Used in Kindergarten

*   **Perimeter:** Perimeter is a module that represents an area in you application (certain component, page, button, header etc.). Perimeter defines methods that should be exposed and rules that must be followed on that particular area.
*   **Sandbox:** Modules (perimeters) are plugged into sandbox and all exposed methods will be accessible through it. Sandbox is governed by a governess and she is the one who makes sure that all rules are followed in order to prevent any kind of troubles.
*   **Governess:** The governess is guarding your sandbox. She makes sure that child doesn't do any unauthorized activities and she can deal with troubles your way!
*   **Child:** Child in Kindergarten represents the current user of your application.

## 2. Core Components

### Sandbox
**Class Description:** Defines the Sandbox class. A Sandbox is an environment where a "child" object can operate under the supervision of a {@link Governess} and according to rules defined in {@link Perimeter}s.

**Example:**
```javascript
const child = {
  toys: ['car', 'doll'],
  play: (toy) => `playing with ${toy}`,
};

const mainGoverness = new HeadGoverness();
const playgroundPerimeter = new Perimeter({
  purpose: 'playground',
  govern: { 'can play': (toy) => child.toys.includes(toy) },
  expose: ['play'],
});

const sandbox = new Sandbox(child, {
  governess: mainGoverness,
  perimeters: [playgroundPerimeter],
});

sandbox.playground.play('car'); // => 'playing with car'
sandbox.playground.play('bike'); // => throws AccessDenied error
```

**Constructor:** `constructor(child = null, options = {})`
*   Creates a new Sandbox instance.
    *   `child` (Object, optional, default: `null`): The child object to be sandboxed.
    *   `options` (Object, optional, default: `{}`): Sandbox options.
    *   `options.governess` (Governess|Function, optional, default: `HeadGoverness`): The main governess for the sandbox or a constructor for one.
    *   `options.perimeters` (Array<Perimeter>, optional, default: `[]`): An array of perimeters to load initially.

**Properties:**
*   `governess` (Governess)
    *   **Description:** The main governess of the sandbox.
    *   **Throws:** `NoGovernessError` - If the provided value is not a Governess instance (on set).

**Methods:**
*   `guard(...args)`
    *   **Description:** Forwards the guard call to the main governess of the sandbox.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `guard` method.
    *   **Returns:** (*) The result of the governess's `guard` method.
*   `loadPerimeter(...perimeters)`
    *   **Description:** Loads one or more perimeters into the sandbox. For each perimeter, it ensures the governess learns its rules and exposes the perimeter's purpose.
    *   **Parameters:**
        *   `perimeters` (...Perimeter): The perimeters to load.
    *   **Returns:** (number) The count of newly added perimeters.
    *   **Throws:** `ArgumentError` - If any of the provided arguments is not a Perimeter instance.
    *   **Example:**
        ```javascript
        sandbox.loadPerimeter(perimeter1, perimeter2);
        ```
*   `loadModule(...args)`
    *   **Description:** Alias for `Sandbox#loadPerimeter`.
    *   **Parameters:**
        *   `args` (...Perimeter): The perimeters to load.
    *   **Returns:** (number) The count of newly added perimeters.
*   `getPerimeters()`
    *   **Description:** Returns all perimeters currently loaded in the sandbox.
    *   **Returns:** (Array<Perimeter>) An array of perimeters.
*   `getPerimeter(purpose)`
    *   **Description:** Retrieves a specific perimeter by its purpose name.
    *   **Parameters:**
        *   `purpose` (string): The purpose name of the perimeter to retrieve.
    *   **Returns:** (Perimeter|null) The found perimeter, or null if not found.
    *   **Example:**
        ```javascript
        const pgPerimeter = sandbox.getPerimeter('playground');
        ```
*   `hasPerimeter(perimeter)`
    *   **Description:** Checks if the sandbox already contains a perimeter with the given purpose or instance.
    *   **Parameters:**
        *   `perimeter` (Perimeter|string): The perimeter instance or its purpose name.
    *   **Returns:** (boolean) True if the perimeter exists in the sandbox, false otherwise.
*   `isAllowed(...args)`
    *   **Description:** Checks if an action is allowed by the main governess of the sandbox.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `isAllowed` method.
    *   **Returns:** (boolean) True if the action is allowed, false otherwise.
*   `isNotAllowed(...args)`
    *   **Description:** Checks if an action is not allowed by the main governess of the sandbox.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `isNotAllowed` method.
    *   **Returns:** (boolean) True if the action is not allowed, false otherwise.
*   `_extendPurpose(perimeter)` (private)
    *   **Description:** Exposes the purpose of a given perimeter on the sandbox instance. This creates a new `Purpose` object or uses an existing one, and loads the perimeter into that purpose. This method is used internally by Sandbox and should not be used externally.
    *   **Parameters:**
        *   `perimeter` (Perimeter): The perimeter whose purpose is to be exposed.
    *   **Throws:** `RestrictedMethodError` - If the perimeter's purpose name is a restricted method name.
*   `_learnRules()` (private)
    *   **Description:** Ensures the main governess learns all rules from all loaded perimeters. This method is used internally by Sandbox and should not be used externally.

### Perimeter
**Class Description:** A Perimeter is used to define the places where a child (sandboxed object) can play. It defines the rules and the governess that will enforce them.

**Example:**
```javascript
const perimeter = new Perimeter({
  purpose: 'playground',
  govern: {
    'can play': true,
    'cannot run': false,
  },
  expose: ['swing', 'slide'],
  governess: new StrictGoverness(),
});
```

**Constructor:** `constructor(purpose, opts = {})`
*   Create new perimeter.
    *   `purpose` (string|Object): The purpose of the perimeter or an options object.
        *   `purpose.purpose` (string, optional): The purpose of the perimeter.
        *   `purpose.govern` (Object, optional): Rules to govern the perimeter.
        *   `purpose.expose` (Array<string>, optional): Methods to expose from the child.
        *   `purpose.governess` (Governess, optional): Governess for the perimeter.
    *   `opts` (Object, optional, default: `{}`): Options object if purpose is a string.
        *   `opts.govern` (Object, optional): Rules to govern the perimeter.
        *   `opts.expose` (Array<string>, optional): Methods to expose from the child.
        *   `opts.governess` (Governess, optional): Governess for the perimeter.

**Properties:**
*   `purpose` (string)
    *   **Description:** The purpose of the perimeter.
    *   **Throws:** `NoPurposeError` - If the purpose is not a string or is a restricted name (on set).
*   `sandbox` (Sandbox)
    *   **Description:** The sandbox associated with this perimeter.
    *   **Throws:** `NoSandboxError` - If the value is not an instance of Sandbox (on set).
*   `governess` (Governess)
    *   **Description:** The governess for this perimeter. If the perimeter has its own governess, it returns it. Otherwise, it returns the governess of its sandbox.

**Methods:**
*   `getPurpose()`
    *   **Description:** Returns the purpose of the perimeter.
    *   **Returns:** (string) The purpose of the perimeter.
*   `getSandbox()`
    *   **Description:** Returns the sandbox of the perimeter.
    *   **Returns:** (Sandbox) The sandbox of the perimeter.
*   `getGoverness()`
    *   **Description:** Returns the governess of the perimeter or the governess of its sandbox.
    *   **Returns:** (Governess) The governess.
*   `hasOwnGoverness()`
    *   **Description:** Checks if the perimeter has its own governess.
    *   **Returns:** (boolean) True if the perimeter has its own governess, false otherwise.
*   `guard(...args)`
    *   **Description:** Forwards the guard call to the governess.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's guard method.
    *   **Returns:** (*) The result of the governess's guard method.
*   `governed(...args)`
    *   **Description:** Forwards the governed call to the governess.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's governed method.
    *   **Returns:** (*) The result of the governess's governed method.
*   `isAllowed(...args)`
    *   **Description:** Forwards the isAllowed call to the governess.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's isAllowed method.
    *   **Returns:** (boolean) The result of the governess's isAllowed method.
*   `isNotAllowed(...args)`
    *   **Description:** Forwards the isNotAllowed call to the governess.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's isNotAllowed method.
    *   **Returns:** (boolean) The result of the governess's isNotAllowed method.
*   `extractGovern(opts)` (private)
    *   **Description:** Extracts and transforms govern rules from options.
    *   **Parameters:**
        *   `opts` (Object): Options object.
            *   `opts.govern` (Object, optional): Govern rules.
            *   `opts.can` (Object, optional): 'can' rules.
            *   `opts.cannot` (Object, optional): 'cannot' rules.
    *   **Returns:** (Object) The extracted govern rules.

### Rule
**Class Description:** Defines a Rule that can be learned and enforced by a {@link Governess}. Rules are typically defined within a {@link Perimeter}.

**Example:**
```javascript
// 'can play': true
const rule1 = new Rule('can play', true);

// 'cannot run': ['slippery floor']
const rule2 = new Rule('cannot run', ['slippery floor']);

// 'can access': /^\/admin\//
const rule3 = new Rule('can access', /^\/admin\//);

// 'can edit': (user, resource) => user.hasPermission(resource, 'edit')
const rule4 = new Rule('can edit', (user, resource) => {
  return user.hasPermission(resource, 'edit');
});
```

**Constructor:** `constructor(str, def)`
*   Creates a new Rule instance.
    *   `str` (string): The string representation of the rule (e.g., 'can read', 'cannot write').
    *   `def` (*): The definition of the rule. This can be a boolean, an array, a RegExp, or a custom function.

**Instance Methods:**
*   `verify(...args)`
    *   **Description:** Verifies if the given arguments satisfy this rule. The verification logic depends on the type of the rule definition.
    *   **Parameters:**
        *   `args` (...*): Arguments to verify against the rule.
    *   **Returns:** (boolean) True if the rule is satisfied, false otherwise.
*   `_verifyItems(subject, ...args)` (private)
    *   **Description:** Verifies if the subject matches any of the items in the rule definition. Used when the rule definition is an array.
    *   **Parameters:**
        *   `subject` (*): The subject to verify.
        *   `args` (...*): Additional arguments (currently ignored by this verification type).
    *   **Returns:** (boolean) True if the subject matches any item, false otherwise.
*   `_verifyRegex(subject, ...args)` (private)
    *   **Description:** Verifies if the subject matches the regular expression in the rule definition. Used when the rule definition is a RegExp.
    *   **Parameters:**
        *   `subject` (string): The subject string to verify.
        *   `args` (...*): Additional arguments (currently ignored by this verification type).
    *   **Returns:** (boolean) True if the subject matches the regex, false otherwise.
*   `_verifyCustomMethod(...args)` (private)
    *   **Description:** Verifies by calling the custom method in the rule definition. Used when the rule definition is a function.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the custom verification method.
    *   **Returns:** (boolean) The result of the custom verification method.

### Purpose
**Class Description:** Defines the Purpose class. A Purpose acts as a bridge between a Sandbox and a Perimeter. When a Perimeter is added to a Sandbox, a new Purpose is created. All methods exposed by the Perimeter are copied to this Purpose. It's designed to have a minimal set of methods. This class is used internally by {@link Sandbox} and typically not instantiated directly by consumers.

**Example:**
```javascript
// Purpose is used internally by Sandbox and usually not instantiated directly.
```

**Constructor:** `constructor(name, sandbox)`
*   Creates a new instance of Purpose.
    *   `name` (string): The name of the purpose.
    *   `sandbox` (Sandbox): The sandbox instance associated with this purpose.
    *   **Throws:** `ArgumentError` - If the name is not a string or if the sandbox is not a valid Sandbox instance.

**Methods:**
*   `_loadPerimeter(perimeter)` (private)
    *   **Description:** Loads a perimeter and copies all its exposed methods into this purpose. This method is used internally by {@link Sandbox} and should not be called externally.
    *   **Parameters:**
        *   `perimeter` (Perimeter): The perimeter to load.
    *   **Throws:**
        *   `ArgumentError` - If the provided perimeter is not a valid Perimeter instance.
        *   `RestrictedMethodError` - If an exposed method name is restricted.
        *   `NoExposedMethodError` - If an exposed method is not defined on the perimeter.
*   `isAllowed(...args)`
    *   **Description:** Checks if the perimeter is allowed to perform an action. It uses the governess of the associated perimeter.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `isAllowed` method.
    *   **Returns:** (boolean) True if the action is allowed, false otherwise.
*   `isNotAllowed(...args)`
    *   **Description:** Checks if the perimeter is not allowed to perform an action. It uses the governess of the associated perimeter.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `isAllowed` method.
    *   **Returns:** (boolean) True if the action is not allowed, false otherwise.
*   `guard(...args)`
    *   **Description:** Forwards the guard call to the governess of the associated perimeter.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the governess's `guard` method.
    *   **Returns:** (*) The result of the governess's `guard` method.


## 3. Governesses

Governesses are responsible for learning and enforcing rules within a Sandbox. Different governesses can implement different enforcement strategies.

### HeadGoverness
**Class Description:** The base class for all Governess types. A Governess is responsible for learning rules and enforcing them. It determines whether actions are allowed or denied based on the learned rules.

**Example:**
```javascript
const headGoverness = new HeadGoverness();
const sandbox = new Sandbox(childObject, { governess: headGoverness });
const perimeter = new Perimeter({
  purpose: 'playground',
  govern: { 'can play': true, 'cannot run': 'too slippery' }
});
headGoverness.learnRules(perimeter);

sandbox.guard('play'); // OK
sandbox.guard('run', 'too slippery'); // Throws AccessDenied
```

**Constructor:** `constructor()`
*   Creates a new instance of HeadGoverness. Initializes an empty array for rules.

**Properties:**
*   `unguarded` (boolean)
    *   **Description:** Gets or sets the `unguarded` status of the governess. If true, `guard` checks are bypassed.

**Methods:**
*   `guard(action, ...args)`
    *   **Description:** Checks if an action is allowed. If not, it throws an `AccessDenied` error. If the governess is `unguarded`, this check is bypassed.
    *   **Parameters:**
        *   `action` (string): The action to check (e.g., 'read', 'write').
        *   `args` (...*): Additional arguments passed to the rule verification logic. The first of these arguments is often considered the "target" of the action.
    *   **Returns:** (*) The first argument (`args[0]`), typically the target, if the action is allowed.
    *   **Throws:** `AccessDenied` - If the action is not allowed.
    *   **Example:** `governess.guard('edit', document);`
*   `governed(callback, args = [], callingContext = null)`
    *   **Description:** Executes a callback function within a given context, applying provided arguments. This method is intended to be overridden by more specialized governesses (like `GermanGoverness`) to inject additional checks (e.g., calling `guard`) before executing the callback. The base implementation simply executes the callback.
    *   **Parameters:**
        *   `callback` (Function): The function to execute.
        *   `args` (Array<*>, optional, default: `[]`): Arguments to apply to the callback.
        *   `callingContext` (Object|null, optional, default: `null`): The context (`this`) in which to execute the callback.
    *   **Returns:** (*) The result of the callback execution.
    *   **Example:**
        ```javascript
        const myMethod = function(val) { return `Called with ${val} in context ${this.name}`; };
        governess.governed(myMethod, ['test'], { name: 'MyContext' });
        // => "Called with test in context MyContext"
        ```
*   `isAllowed(action, ...args)`
    *   **Description:** Determines if an action is allowed based on the learned rules. If the governess is `unguarded`, it always returns true. Otherwise, it checks if there's at least one positive rule allowing the action AND no strict disallowing rules are met.
    *   **Parameters:**
        *   `action` (string): The action to check.
        *   `args` (...*): Arguments passed to the rule verification logic.
    *   **Returns:** (boolean) True if the action is allowed, false otherwise.
    *   **Example:**
        ```javascript
        if (governess.isAllowed('view', page)) {
          // show page
        }
        ```
*   `isNotAllowed(...args)`
    *   **Description:** Determines if an action is not allowed. This is the logical negation of `HeadGoverness#isAllowed`.
    *   **Parameters:**
        *   `args` (...*): Arguments passed to `isAllowed`. The first is typically the action name.
    *   **Returns:** (boolean) True if the action is not allowed, false otherwise.
    *   **Example:**
        ```javascript
        if (governess.isNotAllowed('delete', record)) {
         // show error
        }
        ```
*   `getRules(action)`
    *   **Description:** Retrieves rules, optionally filtered by action type.
    *   **Parameters:**
        *   `action` (string, optional): The action type (e.g., 'read', 'write') to filter rules by. If not provided, all rules are returned.
    *   **Returns:** (Array<Rule>) An array of matching rules.
    *   **Example:**
        ```javascript
        const readRules = governess.getRules('read');
        const allRules = governess.getRules();
        ```
*   `learnRules(perimeter)`
    *   **Description:** Teaches the governess rules from a given `Perimeter`. It iterates over the `govern` object of the perimeter, creates `Rule` instances, and adds them if they haven't been learned already from the same perimeter.
    *   **Parameters:**
        *   `perimeter` (Perimeter): The perimeter from which to learn rules.
    *   **Returns:** (number) The number of new rules learned from this perimeter.
    *   **Example:** `governess.learnRules(myPerimeter);`
*   `addRule(...rules)`
    *   **Description:** Adds one or more rules to the governess.
    *   **Parameters:**
        *   `rules` (...Rule): The `Rule` instances to add.
    *   **Returns:** (number) The number of rules successfully added.
    *   **Throws:** `ArgumentError` - If any of the provided arguments is not a `Rule` instance.
    *   **Example:**
        ```javascript
        const rule1 = new Rule('can fly', true);
        const rule2 = new Rule('cannot swim', 'no water wings');
        governess.addRule(rule1, rule2);
        ```
*   `hasRule(perimeter, rule)` (private)
    *   **Description:** Checks if the governess has already learned a specific rule from a specific perimeter. This prevents adding duplicate rules from the same perimeter.
    *   **Parameters:**
        *   `perimeter` (Perimeter): The perimeter the rule originated from.
        *   `rule` (Rule): The rule to check.
    *   **Returns:** (boolean) True if the rule from that perimeter has already been learned, false otherwise.
*   `hasAnyRules()`
    *   **Description:** Checks if the governess has learned any rules.
    *   **Returns:** (boolean) True if there are any rules, false otherwise.
    *   **Example:**
        ```javascript
        if (governess.hasAnyRules()) {
          // Governess is configured
        }
        ```
*   `doUnguarded(callback, context = null)`
    *   **Description:** Executes a callback function in an unguarded state, then restores the previous state. This is useful for performing actions that should temporarily bypass `guard` checks.
    *   **Parameters:**
        *   `callback` (Function): The function to execute.
        *   `context` (Object|null, optional, default: `null`): The context (`this`) in which to execute the callback.
    *   **Returns:** (*) The result of the callback execution, or undefined if callback is not a function.
    *   **Example:**
        ```javascript
        governess.doUnguarded(() => {
          // Perform some administrative task that should not be guarded
          sensitiveOperation();
        });
        ```
*   `isUnguarded()`
    *   **Description:** Checks if the governess is currently in an unguarded state.
    *   **Returns:** (boolean) True if unguarded, false otherwise.
*   `isGuarded()`
    *   **Description:** Checks if the governess is currently in a guarded state. This is the logical negation of `HeadGoverness#isUnguarded`.
    *   **Returns:** (boolean) True if guarded, false otherwise.

### EasyGoverness
**Class Description:** Represents a lenient governess that allows all actions by default. This governess type sets `unguarded` to `true`, meaning that unless a specific rule denies an action, it will be permitted. It inherits from `HeadGoverness`.

**Extends:** `HeadGoverness`

**Example:**
```javascript
const easyGoverness = new EasyGoverness();
const sandbox = new Sandbox(child, { governess: easyGoverness });

// Unless a 'cannot' rule exists for 'doSomething', this will be allowed.
sandbox.guard('doSomething');
```

**Constructor:** `constructor(...args)`
*   Creates an instance of EasyGoverness. Sets the `unguarded` property to `true`.
    *   `args` (...*): Arguments passed to the `HeadGoverness` constructor.

*(Inherits methods from HeadGoverness. The key behavior change is `unguarded` being true by default.)*

### GermanGoverness
**Class Description:** Represents a governess that enforces rules strictly by automatically guarding all exposed methods of a `Perimeter`. When an exposed method is called, this governess first calls its own `guard` method, using the name of the exposed method as the action to check.

**Extends:** `HeadGoverness`

**Example:**
```javascript
const germanGoverness = new GermanGoverness();
const perimeter = new Perimeter({
  purpose: 'restrictedActions',
  governess: germanGoverness,
  expose: ['doSecretTask'],
  govern: {
    'can doSecretTask': false // or a function (user) => user.isAdmin
  },
  doSecretTask() {
    return 'Secret task done.';
  }
});
const sandbox = new Sandbox({}, { perimeters: [perimeter] });

// This will automatically call perimeter.governess.guard('doSecretTask', ...args)
// before executing doSecretTask.
sandbox.restrictedActions.doSecretTask(); // Throws AccessDenied if 'can doSecretTask' is false
```

**Methods (Overrides):**
*   `governed(callback, args = [], callingContext = null)`
    *   **Description:** Overrides the `governed` method from `HeadGoverness`. Before executing the callback (the exposed method), this method automatically calls `this.guard()` with the detected name of the exposed method and its arguments.
    *   **Parameters:**
        *   `callback` (Function): The original method to be executed (an exposed method from a Perimeter).
        *   `args` (Array<*>, optional, default: `[]`): The arguments passed to the original method.
        *   `callingContext` (Perimeter|null, optional, default: `null`): The perimeter instance from which the method is called.
    *   **Returns:** (*) The result of the original callback execution.
    *   **Throws:**
        *   `Error` - If the `callingContext` is not a Perimeter.
        *   `AccessDenied` - If the guard check fails.
*   `_detectNameOfExposedMethod(perimeter, method)` (private)
    *   **Description:** Detects the name of an exposed method on a perimeter. This is used to automatically determine the action name for the `guard` call.
    *   **Parameters:**
        *   `perimeter` (Perimeter): The perimeter to search for the method.
        *   `method` (Function): The method function itself.
    *   **Returns:** (string|undefined) The name of the exposed method, or undefined if not found.
    *   **Throws:** `Error` - If the provided object is not a Perimeter.

*(Inherits other methods from HeadGoverness.)*

### MiddlewareGoverness
**Class Description:** A governess that allows a middleware function to be executed before the actual `governed` logic of `HeadGoverness` is called. The middleware function receives the governess instance and all arguments passed to the `governed` method.

**Extends:** `HeadGoverness`

**Example:**
```javascript
const myMiddleware = (governess, originalCallback, originalArgs, callingContext) => {
  console.log(`Middleware called for action on context: ${callingContext.purpose}`);
  // Middleware could, for example, call governess.guard() here,
  // modify arguments, or perform logging.
  // governess.guard('someAction', ...originalArgs);
};

const middlewareGoverness = new MiddlewareGoverness(myMiddleware);
const perimeter = new Perimeter({
  purpose: 'logging',
  governess: middlewareGoverness,
  expose: ['doWork'],
  doWork(task) {
    return `Work done on: ${task}`;
  }
});
const sandbox = new Sandbox({}, { perimeters: [perimeter] });

sandbox.logging.doWork('documentation');
// Console will show: "Middleware called for action on context: logging"
// Then the doWork method executes.
```

**Constructor:** `constructor(middleware, ...headGovernessArgs)`
*   Creates an instance of MiddlewareGoverness.
    *   `middleware` (Function): The middleware function to be executed. This function will be called with `(governessInstance, originalCallback, originalArgs, callingContext)`.
    *   `headGovernessArgs` (...*): Arguments to be passed to the `HeadGoverness` constructor.

**Methods (Overrides):**
*   `governed(callback, args = [], callingContext = null)`
    *   **Description:** Overrides the `governed` method from `HeadGoverness`. It first executes the provided middleware function and then calls the original `governed` method of the `HeadGoverness`.
    *   **Parameters:**
        *   `callback` (Function): The original method to be executed.
        *   `args` (Array<*>, optional, default: `[]`): The arguments passed to the original method.
        *   `callingContext` (Object|null, optional, default: `null`): The context in which the original method is called.
    *   **Returns:** (*) The result of the original callback execution via `HeadGoverness.prototype.governed`.

*(Inherits other methods from HeadGoverness.)*

### StrictGoverness
**Class Description:** A governess that enforces a strict policy: every call to an exposed method (via `governed`) must be preceded by a corresponding call to `guard`. It tracks the counts of `governed` and `guard` calls. If `governed` is called more times than `guard` (and the governess is not `unguarded`), it throws an `AccessDenied` error, assuming a `guard` call was missed. This is useful to ensure that all exposed functionalities are explicitly checked for permissions. Note: This governess executes the exposed method first and then checks the counts. If `guard` was not called, the method still runs, but an error is thrown afterwards.

**Extends:** `HeadGoverness`

**Example:**
```javascript
const strictGoverness = new StrictGoverness();
const perimeter = new Perimeter({
  purpose: 'strictAccess',
  governess: strictGoverness,
  expose: ['taskOne', 'taskTwo'],
  govern: { 'can taskOne': true, 'can taskTwo': true },
  taskOne() {
    this.governess.guard('taskOne'); // Correct: guard is called
    return 'Task one done.';
  },
  taskTwo() {
    // Incorrect: guard('taskTwo') is NOT called
    return 'Task two done.';
  }
});
const sandbox = new Sandbox({}, { perimeters: [perimeter] });

sandbox.strictAccess.taskOne(); // OK
sandbox.strictAccess.taskTwo(); // Executes taskTwo, then throws AccessDenied
```

**Constructor:** `constructor(...args)`
*   Creates an instance of StrictGoverness. Initializes `_guardCount` and `_governedCount` to 0.
    *   `args` (...*): Arguments passed to the `HeadGoverness` constructor.

**Methods (Overrides):**
*   `governed(callback, args = [], callingContext = null)`
    *   **Description:** Overrides the `governed` method from `HeadGoverness`. It executes the original method via the parent's `governed` call, then increments its internal `_governedCount`. If this count exceeds `_guardCount` and the governess is not `unguarded`, it throws an `AccessDenied` error.
    *   **Parameters:**
        *   `callback` (Function): The original method to be executed.
        *   `args` (Array<*>, optional, default: `[]`): The arguments passed to the original method.
        *   `callingContext` (Object|null, optional, default: `null`): The context in which the original method is called.
    *   **Returns:** (*) The result of the original callback execution.
    *   **Throws:** `AccessDenied` - If `_governedCount` exceeds `_guardCount` and not `unguarded`.
*   `guard(action, ...args)`
    *   **Description:** Overrides the `guard` method from `HeadGoverness`. It increments its internal `_guardCount` before calling the parent's `guard` method.
    *   **Parameters:**
        *   `action` (string): The action to check.
        *   `args` (...*): Additional arguments passed to the rule verification logic.
    *   **Returns:** (*) The result of the parent's `guard` method call.
    *   **Throws:** `AccessDenied` - If the parent's `guard` method denies access.
*   `_resetCounts()` (private)
    *   **Description:** Resets the guard and governed counters. This might be called after an error or if a reset is needed.

*(Inherits other methods from HeadGoverness.)*

## 4. Decorators

### @guard
**Description:** A method decorator factory that protects methods within a `Sandbox` or `Perimeter`. It uses the `guard` method of the class instance (either Sandbox or Perimeter) to check for permissions before executing the decorated method.

**Parameters:**
*   `actionName` (string, optional): The name of the action/rule to check. If not provided, the name of the decorated method will be used as the action name.
*   `accessDeniedCallback` (Function|*, optional): A function to call or a value to return if access is denied. If it's a function, it will be called with the same arguments as the original method. If it's a value, that value will be returned. If not provided, an `AccessDenied` error will be thrown.

**Returns:** (Function) The method decorator.

**Throws:** `Error` - If used on a class that is not a Sandbox or Perimeter, or doesn't have a `guard` method.

**Example:**
```javascript
import { Sandbox, Perimeter, guard } from 'kindergarten';

class MyPerimeter extends Perimeter {
  constructor() {
    super({ purpose: 'restrictedArea' });
    this.governess.learnRules({
      'can enter': false,
      'can viewData': true,
      'can_edit_document': (user, doc) => doc.owner === user.id
    });
  }

  @guard // actionName will be 'guardedMethodExample'
  guardedMethodExample() {
    return 'You got in!';
  }

  @guard('enter') // specific actionName
  anotherGuardedMethod() {
    return 'Entered successfully!';
  }

  @guard('enter', () => 'Access was denied, returned this instead.')
  methodWithCallback() {
    return 'This should not be returned if access is denied.';
  }

  @guard('editDocument') // Will use 'editDocument' as action name
  editDocument(user, document) {
    // ... logic to edit document
    return 'Document updated.';
  }
}

const perimeter = new MyPerimeter();
const sandbox = new Sandbox({});
sandbox.loadPerimeter(perimeter);

sandbox.restrictedArea.guardedMethodExample(); // Throws AccessDenied
sandbox.restrictedArea.anotherGuardedMethod(); // Throws AccessDenied
sandbox.restrictedArea.methodWithCallback(); // Returns 'Access was denied, returned this instead.'

const user1 = { id: 1 };
const user2 = { id: 2 };
const doc1 = { owner: 1, content: 'Hello' };

sandbox.restrictedArea.editDocument(user1, doc1); // Returns 'Document updated.'
sandbox.restrictedArea.editDocument(user2, doc1); // Throws AccessDenied
```

### @sandbox
**Description:** A class decorator factory that integrates a `Sandbox` instance into a target class. It creates a new Sandbox instance with the provided arguments and mixes its methods and properties into the decorated class's instances.

**Parameters:**
*   `sandboxArgs` (...*): Arguments to be passed to the `Sandbox` constructor. This typically includes the child object and options like `governess` and `perimeters`.

**Returns:** (Function) The class decorator.

**Throws:** `Error` - If a property from the sandbox instance already exists on the target class instance.

**Example:**
```javascript
import { sandbox, HeadGoverness, Perimeter } from 'kindergarten';

const childObject = {
  secret: 'candy stash',
  getSecret: function() { return this.secret; }
};

const perimeter = new Perimeter({
 purpose: 'secrets',
 govern: { 'can getSecret': false },
 expose: ['getSecret']
});

// Apply the sandbox decorator to a class
// Pass sandbox constructor arguments here (child, options)
@sandbox(childObject, { governess: new HeadGoverness(), perimeters: [perimeter] })
class MySecureClass {
  constructor(name) {
    this.name = name;
  }

  // This class now has methods like:
  // this.loadPerimeter(), this.guard(), this.isAllowed(),
  // this.secrets.getSecret() (which will be guarded)
  // and properties like this.governess

  displaySecret() {
    try {
      // Accessing the sandboxed method via the purpose
      return `The secret is: ${this.secrets.getSecret()}`;
    } catch (e) {
      return e.message;
    }
  }
}

const instance = new MySecureClass('Mr. Secure');
console.log(instance.name); // Output: Mr. Secure

// Trying to access the guarded method
console.log(instance.displaySecret()); // Output: Access to method getSecret is denied.

// We can interact with the sandbox features directly on the instance
instance.governess.learnRules(new Perimeter({
 purpose: 'secrets', // Redefine or add rules
 govern: { 'can getSecret': true }
}));
console.log(instance.displaySecret()); // Output: The secret is: candy stash
```

## 5. Factory Functions

*   **`createSandbox(...args)`**
    *   **Description:** Factory function to create a new instance of `Sandbox`. This is a convenience function that passes all arguments directly to the `Sandbox` constructor.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the `Sandbox` constructor.
    *   **Returns:** (Sandbox) A new instance of Sandbox.
    *   **Example:**
        ```javascript
        import { createSandbox, HeadGoverness } from 'kindergarten';

        const child = { name: 'Max' };
        const sandbox = createSandbox(child, {
          governess: new HeadGoverness(),
        });
        ```
*   **`createPerimeter(...args)`**
    *   **Description:** Factory function to create a new instance of `Perimeter`. This is a convenience function that passes all arguments directly to the `Perimeter` constructor.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the `Perimeter` constructor.
    *   **Returns:** (Perimeter) A new instance of Perimeter.
    *   **Example:**
        ```javascript
        import { createPerimeter } from 'kindergarten';

        const perimeter = createPerimeter({
          purpose: 'api',
          govern: {
            'can read': true,
          },
        });
        ```
*   **`createRule(...args)`**
    *   **Description:** Factory function to create a new instance of `Rule`. This is a convenience function that passes all arguments directly to the `Rule` constructor.
    *   **Parameters:**
        *   `args` (...*): Arguments to pass to the `Rule` constructor.
    *   **Returns:** (Rule) A new instance of Rule.
    *   **Example:**
        ```javascript
        import { createRule } from 'kindergarten';

        const rule = createRule('can play', true);
        ```

## 6. Custom Errors

*   **`AccessDenied(message)`**: Custom error class indicating that an action or access was denied.
*   **`ArgumentError(message)`**: Custom error class indicating that a function or constructor was called with an invalid argument.
*   **`NoExposedMethodError(message)`**: Custom error class indicating that a method expected to be exposed by a `Perimeter` was not found or is not a function.
*   **`NoGovernessError(message)`**: Custom error class indicating that a `Governess` instance was expected but not found, or an invalid Governess was provided.
*   **`NoPurposeError(message)`**: Custom error class indicating that a `Perimeter` was defined without a purpose, or with an invalid purpose.
*   **`NoSandboxError(message)`**: Custom error class indicating that a `Sandbox` instance was expected but not found, or an invalid Sandbox was provided.
*   **`RestrictedMethodError(message)`**: Custom error class indicating that an attempt was made to use a restricted method name.
*   **`WrongRuleDefinition(message)`**: Custom error class indicating that a rule was defined with an invalid or unsupported format.

## 7. Utility Functions

### AllowedMethodsService
**Class Description:** Service class to determine if a method name is safe to be added to an object. It checks against existing properties of a `dummyObj` (representing the object to be extended), JavaScript reserved words, and a custom list of unsafe names.

**Constructor:** `constructor(dummyObj = {}, isStrict = true)`
*   Creates an instance of AllowedMethodsService.
    *   `dummyObj` (Object, optional, default: `{}`): An object instance whose existing properties will be considered restricted.
    *   `isStrict` (boolean, optional, default: `true`): If true, the list of restricted methods from `dummyObj` is re-evaluated on each call to `isRestricted`.

**Methods:**
*   `isRestricted(methodName)`
    *   **Description:** Checks if a given method name is restricted.
    *   **Parameters:**
        *   `methodName` (string): The method name to check.
    *   **Returns:** (boolean) True if the method name is restricted, false otherwise.

### Type Checking Functions

*   **`isGoverness(obj)`**
    *   **Description:** Checks if a given object is an instance of `HeadGoverness` (or its subclasses).
    *   **Parameters:** `obj` (*): The object to check.
    *   **Returns:** (boolean) True if the object is a Governess instance, false otherwise.
*   **`isPerimeter(obj)`**
    *   **Description:** Checks if a given object is an instance of `Perimeter`.
    *   **Parameters:** `obj` (*): The object to check.
    *   **Returns:** (boolean) True if the object is a Perimeter instance, false otherwise.
*   **`isPurpose(obj)`**
    *   **Description:** Checks if a given object is an instance of `Purpose`.
    *   **Parameters:** `obj` (*): The object to check.
    *   **Returns:** (boolean) True if the object is a Purpose instance, false otherwise.
*   **`isRule(obj)`**
    *   **Description:** Checks if a given object is an instance of `Rule`.
    *   **Parameters:** `obj` (*): The object to check.
    *   **Returns:** (boolean) True if the object is a Rule instance, false otherwise.
*   **`isSandbox(obj)`**
    *   **Description:** Checks if a given object is an instance of `Sandbox`.
    *   **Parameters:** `obj` (*): The object to check.
    *   **Returns:** (boolean) True if the object is a Sandbox instance, false otherwise.

### Rule Internals (Definition and Type)

These classes are primarily used internally by the `Rule` class.

*   **`Definition(rule, def)`**
    *   **Description:** Represents the definition part of a `Rule`. It analyzes the raw rule definition (e.g., an array, a RegExp, a function) to determine its type and characteristics.
    *   **Constructor Parameters:**
        *   `rule` (Rule): The parent `Rule` instance.
        *   `def` (*): The raw rule definition.
    *   **Methods:**
        *   `isStrict()`: (boolean) Determines if the rule definition implies strict checking.
*   **`Type(rule, str)`**
    *   **Description:** Represents the type information of a `Rule`, parsed from a rule string like "can read". It validates the format and extracts the action and whether it's positive ("can") or negative ("cannot").
    *   **Constructor Parameters:**
        *   `rule` (Rule): The parent `Rule` instance.
        *   `str` (string): The raw rule string.
    *   **Methods:**
        *   `validate()`: (true) Validates the extracted rule type. Throws `WrongRuleDefinition` if invalid.
        *   `isPositive()`: (boolean) Checks if the rule type is positive.
        *   `isNegative()`: (boolean) Checks if the rule type is negative.
        *   `isOfType(action)`: (boolean) Checks if the rule's action type matches the given action string.
