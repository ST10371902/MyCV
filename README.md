# OnlineCV - Mishie Mangarateke Portfolio

A modern, animated portfolio website showcasing web and mobile development work.

## Features

- **Interactive 3D Logo** - Three.js powered 3D MangamTech logo in the hero section
- **Ambient Particle System** - Floating orange particles throughout the site
- **Dark/Light Theme** - Toggle between themes with smooth transitions
- **Responsive Design** - Optimized for all screen sizes
- **Smooth Animations** - Scroll-triggered animations and hover effects
- **Project Gallery** - Horizontal scrolling for project showcases

## Tech Stack

- **Framework:** ASP.NET Core MVC (.NET 9.0)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics:** Three.js (r128)
- **Styling:** Custom CSS with CSS Variables
- **Fonts:** Inter, Playfair Display (Google Fonts)

## Project Structure

```
OnlineCV/
├── Controllers/
│   └── HomeController.cs
├── Views/
│   ├── Home/
│   │   └── Index.cshtml
│   └── Shared/
│       └── _Layout.cshtml
├── wwwroot/
│   ├── 3D/
│   │   └── mangamtech_logo.glb
│   ├── css/
│   │   └── site.css
│   ├── js/
│   │   └── site.js
│   ├── Images/
│   ├── Documents/
│   └── favicon.ico
└── Program.cs
```

## Getting Started

### Prerequisites

- .NET 9.0 SDK
- Visual Studio 2022 or VS Code

### Running Locally

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/OnlineCV.git
   ```

2. Navigate to the project directory
   ```bash
   cd OnlineCV/OnlineCV
   ```

3. Restore dependencies
   ```bash
   dotnet restore
   ```

4. Run the application
   ```bash
   dotnet run
   ```

5. Open your browser to `https://localhost:5001` or `http://localhost:5000`

## Sections

- **Hero** - Welcome section with 3D animated logo
- **Profile** - About me and contact information
- **Skills** - Technical skills and tools
- **Experience** - Work history and roles
- **Projects** - Portfolio of completed projects
- **Clients** - Client testimonials and logos
- **Achievements** - Certifications and accomplishments
- **Contact** - Get in touch form

## Customization

### Changing Colors

Edit the CSS variables in `wwwroot/css/site.css`:

```css
:root {
    --color-accent: #f97316;      /* Primary orange */
    --color-highlight: #38bdf8;   /* Secondary blue */
    --color-bg: #0b1120;          /* Dark background */
}
```

## License

Copyright 2025 Mishie Mangarateke. All rights reserved.

## Contact

- **Email:** mangaratekethe1@gmail.com
- **Phone:** +27 78 663 7332
- **LinkedIn:** [Mishie Mangarateke](https://www.linkedin.com/in/mishie-mangarateke-88b656293)

---

*Big or small, digitalise them all.*
