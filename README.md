# Evericons
A set of icons taken from Untitled Icons and converted to React components.

## Basic Usage

All icon styles are preconfigured to be stylable by setting the `color` CSS property, except `lottie` animation icons, either manually or using utility classes like `text-gray-500` in a framework like [Tailwind CSS](https://tailwindcss.com).

First, install `evericons`:

```sh
npm install https://github.com/Everstage/evericons.git
```

Now each icon can be imported individually as a React component:

```js
import { DownloadIcon } from 'evericons/outlined'

function MyComponent() {
  return (
    <div>
      <DownloadIcon className="h-6 w-6 text-blue-500" />
      <p>...</p>
    </div>
  )
}
```
There are 5 types of icon styles available:
- `outlined`, do `import { DownloadIcon } from 'evericons/outlined'`
- `solid`, do `import { DownloadIcon } from 'evericons/solid'`
- `duotone` do `import { DownloadIcon } from 'evericons/duotone'`
- `duocolor` do `import { DownloadIcon } from 'evericons/duocolor'`
- `lottie` do `import { DownloadLottie } from 'evericons/lottie'`
