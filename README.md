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
- `outlined`, do 
  ```js
  import { DownloadIcon } from 'evericons/outlined'
  ```
- `duotone`, do 
  ```js
  import { DownloadIcon } from 'evericons/duotone'
  ```
- `duocolor`, do 
  ```js
  import { DownloadIcon } from 'evericons/duocolor'
  ```
- `lottie`, do 
  ```js
  import { DownloadIcon } from 'evericons/lottie'
  ```

##How to add a new icon:
- Add the icon to the appropriate folder inside `src`.
- E.g. if the icon is an outlined icon, add it to `src/outlined`.
- Name the icon in kebab-case. E.g. `filter-funnel.svg`.
- Once added commit and push the changes.
- In the destination project run, `npm update evericons`.
- The build process will convert the name to *PascalCase* and also add the suffix, *Icon* to the name. E.g. `FilterFunnelIcon`.
- Now in the destination project you can use the icon as follows:
  ```js
  import { FilterFunnelIcon } from 'evericons/outlined'
  ```