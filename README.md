# Evericons
A set of icons taken from Untitled Icons and converted to React components.

## Basic Usage

All icon styles are preconfigured to be stylable by setting the `color` CSS property, either manually or using utility classes like `text-primary` (except `lottie` animation icons, they cannot be styled like that).

*Todo: check if lottie icons can be styled using `color` property.*

First, install `evericons` (In case of everstage-spm, it is installed already):

```sh
npm install https://github.com/Everstage/evericons.git
```

Now each icon can be imported individually as a React component:

```js
import { DownloadIcon } from 'evericons/outlined'

function MyComponent() {
  return (
    <div>
      <DownloadIcon className="h-6 w-6 text-primary" />
      <p>...</p>
    </div>
  )
}
```
There are 5 types of icon styles available:
- For `outlined`, do 
  ```js
  import { DownloadIcon } from 'evericons/outlined'
  ```
- For `duotone`, do 
  ```js
  import { DownloadIcon } from 'evericons/duotone'
  ```
- For `duocolor`, do 
  ```js
  import { DownloadIcon } from 'evericons/duocolor'
  ```
- For `solid`, do 
  ```js
  import { DownloadIcon } from 'evericons/solid'
  ```
- For `lottie`, do 
  ```js
  import { DownloadLottie } from 'evericons/lottie'
  ```

##How to add a new icon:
- Add the icon to the appropriate folder inside `src`.
- E.g. if the icon is an outlined icon, add it to `src/outlined`.
- Name the icon in kebab-case. E.g. `filter-funnel.svg`.
- Once added commit and push the changes.
- In the destination project run, `npm update evericons`.
- The build process will convert the name to *PascalCase* and also add the suffix, *Icon* or *Lottie* to the name. E.g. `FilterFunnelIcon` or `FilterFunnelLottie`.
- Now in the destination project you can use the icon as follows:
  ```js
  import { FilterFunnelIcon } from 'evericons/outlined'
  ```