# LibraRyx

LibraRyx is a minimalist web-based ebook library designed for fast access, clean organization, and a smooth user experience across desktop and mobile devices.

## Features

- Searchable book library
- Clean and responsive user interface
- Category-based browsing (if implemented)
- Direct access to ebooks via Google Drive links
- Lightweight and fast (no backend required)

## Live Demo

https://ravionry.github.io/libraryx/

## Project Structure

```

libraryx/
├── index.html        # Main page
├── style.css         # Styling
├── script.js         # Functionality
├── books.json        # Book data (optional)

````

## How It Works

LibraRyx is a static website hosted using GitHub Pages. Book data can either be:

- Hardcoded in `index.html`, or  
- Dynamically loaded from `books.json`

Example `books.json` format:

```json
[
  {
    "title": "Atomic Habits",
    "link": "https://drive.google.com/file/d/FILE_ID/preview"
  }
]
````

## Deployment (GitHub Pages)

1. Push your project to a public GitHub repository
2. Go to **Settings > Pages**
3. Under **Source**, select:

   * Branch: `main`
   * Folder: `/ (root)`
4. Save and wait for deployment

Your site will be available at:

```
https://yourusername.github.io/libraryx/
```

## Google Drive Links

For best compatibility, use preview or direct access links:

```
https://drive.google.com/file/d/FILE_ID/preview
```

or

```
https://drive.google.com/uc?id=FILE_ID
```

## Customization

You can extend LibraRyx with:

* Categories and filters
* Admin-only book upload interface
* Dark/light mode toggle
* Favorites or bookmarks system

## Limitations

* No backend (static only)
* Book additions require editing files manually or using a local script
* No authentication system

## Future Improvements

* Search optimization
* Tagging system
* Pagination for large libraries
* Offline support (PWA)
