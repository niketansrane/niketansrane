# Niketan Rane's Personal Website

This is my personal website built from scratch as I learn HTML and CSS.

🌐 **Live Site**: Will be available at `https://niketansrane.github.io/niketansrane` once deployed

## Project Structure

```
niketansrane/
├── index.html          # Main homepage
├── about.html          # About page
├── blogs/              # Blog section
│   ├── index.html      # Blog listing
│   ├── my-first-blog-post.html
│   └── learning-html-css.html
└── README.md           # This file
```

## Features

- Clean, minimalist design
- Fully responsive layout
- Blog functionality with multiple posts
- Experience and Projects sections
- Social media links with icons

## Deployment to GitHub Pages

This site is hosted on GitHub Pages. To deploy:

1. Go to: https://github.com/new
2. Create a new repository named `niketansrane` (or any name you prefer)
3. **Important**: Do NOT initialize with README, .gitignore, or license
4. After creating, run these commands in your local directory:

```bash
git remote add origin https://github.com/YOUR-USERNAME/niketansrane.git
git branch -M main
git push -u origin main
```

5. Go to repository Settings → Pages
6. Under "Source", select "Deploy from a branch"
7. Select branch: `main` and folder: `/ (root)`
8. Click Save
9. Wait 1-2 minutes, then visit: `https://YOUR-USERNAME.github.io/niketansrane`

## Local Development

To view the website locally:

### Option 1: Just open the file
- Double-click `index.html` and it will open in your default browser

### Option 2: Using Python
```bash
python -m http.server 8000
# Then open http://localhost:8000
```

### Option 3: Using Node.js
```bash
npx http-server -p 8000
# Then open http://localhost:8000
```

## Making Changes

1. Edit any HTML file in your favorite code editor (VS Code recommended)
2. Save the file
3. Refresh your browser to see changes
4. Commit your changes:
```bash
git add .
git commit -m "Description of changes"
git push
```
5. GitHub Pages will automatically update (takes 1-2 minutes)

## Technologies Used

- HTML5
- CSS3
- SVG icons
- No JavaScript (yet!)
- No build process or frameworks

## Future Plans

- [ ] Add dark mode toggle
- [ ] Add more blog posts
- [ ] Add search functionality
- [ ] Add RSS feed for blog
- [ ] Add projects showcase with images
- [ ] Custom domain (optional)

## Contact

- Email: niketan.iiita@gmail.com
- GitHub: [@niketansrane](https://github.com/niketansrane)
- LinkedIn: [Niketan Rane](https://linkedin.com/in/niketansrane)
- Twitter: [@niketansrane](https://twitter.com/niketansrane)
