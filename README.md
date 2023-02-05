# Design token automation
This repo demonstrates a simple design automation workflow that handles design tokens, their transformation to css vars, and pushing updated css files to another project repo.

With the increased usage of Figma and Tokens Studio (aka Figma Tokens) to help define and manage design decisions, opportunities for the automation of previously manual tasks opened. For example, it's still relatively common for design decisions to be made in a tool like Figma, XD, or Sketch, outputted to a static artifact (e.g., PDF or style guide). Design and development deliverables are loosely coupled and need to be manually updated. 

The degree of integration between design and development fall on a spectrum; the above example on one side, with fully automated workflows on the other. This demo code is meant to show how we can move a step or two from manual workflows toward the automated side.

## High-level workflow
Design Tokens -> push to repo -> transform tokens -> output to css variables -> push css variables to project/component code -> build code components


### Tools
From the design side, I already mentioned [Figma](https://www.figma.com/design/) + [Figma Tokens](https://tokens.studio/), but this could be any design tool that can output a structured .json file that represents the design decisions (tokens). 

Since design systems are usually defined and at least co-owned by design teams, much of the work originates and is maintained in tools like Figma. Having a way to seperate out the color, spacing, and typography choices so that they can be available outside of the design tool is what makes tools like Figma Tokens valuable. Keeping the tokens in a central location (e.g., github) allow the design teams to read and write, while development teams and downstream processes can read from the central location.

Because there is usually not a 1:1 mapping from design tokens to the css/scss/sass code, we rely on tools like [Token Transformer](https://www.npmjs.com/package/token-transformer) `token-transformer` and [Style Dictionary](https://www.npmjs.com/package/style-dictionary) `style-dictionary` to format the design token .json to something that can be consumed on the development side. 

We use tools like those above and [Github Actions](https://github.com/features/actions) to help orchestrate the workflow so that, for instance, when a designer makes a change to a design token, it is pushed to the central location. A workflow action will be triggered to run the necessary transforms on the design tokens and output a set of css variables which are in-turn pushed to a project or repository where the code components can consume changes.

### Result
The result is an automated round-trip in which a design update originating in a design tool like Figma is realized in newly published code with no manual intervention.

---
### Inspiration, Caveats, & Todos
This is a super-simple implementation that utilizes lots of ideas pulled together from sources like [Michael Mang](https://github.com/michaelmang) and [Jan Six](https://github.com/six7). There is *a lot* of room for improvement in this repo, for instance the design tokens structure and naming need to be refactored and is not something I would necessarily recommend outside of a proof-of-concept project. I need to bump some of the action versions, and the [destination repository](https://github.com/nyan-matt/stencil-storybook-token-demo) consuming the the css output requires some some build automation. 
Hopefully will be able to get to this soon, along with a follow-up blog post. 
