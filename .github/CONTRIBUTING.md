# Contributing

There are many ways to contribute to this project.

### Submit an issue

Submitting an issue, especially regarding a bug, is one of the best ways to contribute to this project. If you can provide a sample note that reproduces the problem we'll be halfway towards fixing the issue already.

### Improve the tests

Our tests might not cover all possible scenarios, by improving our tests, either by adding new ones or editing existing ones, you'll ensure that the library covers more use cases and you'll decrease the probability that we'll introduce any regressions in the future.

How our tests work is described below.

### Implement a provider

Implementing an additional provider, or improving an existing one, would be the most impactful way to contribute to this project.

In order to implement a new provider you'll need to:

#### Learn how a provider works

Take a look at existing [providers](https://github.com/notable/dumper/tree/master/src/providers) first. Overall they are relatively straightforward, each of them is usually divided into 3 classes:

- The `Provider` class generally defines some metadata, the `name` of the provided and the supported `extensions`, and if each supported source file needs some special processing or may contain multiple notes you'll have to implement the `getNotesRaw` method too, which provides the objects that will be passed to the `Note` class.
- The `Note` class generally implements a method for retrieving the metadata of a note, `getMetadata`, and a method for retrieving its content, `getContent`. If you need to format its content or convert it to Markdown you should implement the `formatContent` method too.
- The `Attachment` class generally implements a method for retrieving the metadata of an attachment, `getMetadata`, and a method for retrieving its content, `getContent`.

Some additional tips:

- If you need some provider-specific utilities just define them as methods of the relevant classes.
- If you need some more general utilities you should define them in [`utils.ts`](https://github.com/notable/dumper/blob/master/src/utils.ts), so that they can be used by other providers too.
- It's important to maintain the dependency tree, visible by running the `npm list -prod` command, as short and lightweight possible.
  - Think if you really need to add a new dependency, perhaps you can just implement a few functions yourself.
  - Think if you can reuse existing dependencies rather than introducting new ones.
  - Think if the dependency you're introducting is the most lightweight available.

Once your new provider is implemented just add it to the list of supported providers, [here](https://github.com/notable/dumper/blob/a3829f748e729043b3cdb1c887b394ad4124071a/src/index.ts#L12), and write some tests for it.

#### Learn how tests works

This library is tested via [test-diff](https://github.com/fabiospampinato/test-diff), read its readme before proceeding further.

Our `test` folder is structured like so:

```
test
├─┬ check           # Directory containing the expected output
│ └─┬ [provider]    # Name of the provider
│   └─┬ [file]      # Name of the dumped file
│     └── [files]   # All the dumped notes, attachments and metadata
├─┬ output          # Directory containing the actual output
│ └─┬ [provider]    # Name of the provider
│   └─┬ [file]      # Name of the dumped file
│     └── [files]   # All the dumped notes, attachments and metadata
└─┬ source          # Directory containing all the files to dump
  └─┬ [provider]    # Name of the provider
    └── [file]      # Name of the file to dump
```

Basically each `source/[provider]/[file]` is a test file to dump, their dumped notes, attachments and metadata will be written in `output/[provider]/[file]/*`, and then they will be compared against the files found under `check`. If the files under `check` and `output` match exactly than the tests pass, if there are some differences then the tests fail.

In order to add tests for your new provider you'll need to:

1. Create a new folder under `source`, named like your provider.
2. Add a few sources files to it, basically some files that will be parsed by the library.
3. Create a new folder under `check`, named like your provider.
4. Add a new folder to it for each source file added previously.
5. Inside each of those folders write what the expected output should be.
   - It might be easier to first run the test suite, so that the `output` folder gets filled, and then copying files from `output` to `check`, fixing any potential errors manually.

Some additional tips:

- It's important to check that pretty much everything that can be written in a particular format can be dumped properly. For instance for the `enex` provider I wrote a sample note, `sample.enex`, in Evernote, containing all the possible formatting options allowed by the program, and then checked that the dumped note, once rendered, resembled the original one as closely as possible.
- It's important to add support for attachments too if the particular format you're writing a provider for supports them.

There are multiple ways to run the test suite:

```sh
node test # Run all the tests
node test --provider enex # Run only the tests of the "enex" provider
node test --file sample.enex # Run only the "sample.enex" test file
```
