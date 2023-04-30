<p align="center">
  Everstage icons
<p>

## Basic Usage

Both icon styles are preconfigured to be stylable by setting the `color` CSS property, either manually or using utility classes like `text-gray-500` in a framework like [Tailwind CSS](https://tailwindcss.com).

## React

First, install `evericons`:

```sh
npm install https://github.com/Everstage/evericons.git
```

Now each icon can be imported individually as a React component:

```js
import { BeakerIcon } from 'evericons/react'

function MyComponent() {
  return (
    <div>
      <BeakerIcon className="h-6 w-6 text-blue-500" />
      <p>...</p>
    </div>
  )
}
```

The 24x24 outline icons can be imported from `@heroicons/react/24/outline`, the 24x24 solid icons can be imported from `@heroicons/react/24/solid`, and the 20x20 solid icons can be imported from `@heroicons/react/20/solid`.

Icons use an upper camel case naming convention and are always suffixed with the word `Icon`.
