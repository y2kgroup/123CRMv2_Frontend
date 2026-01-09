This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Development Changelog

### Front-end Session #1 (Jan 9th, 2026)
**Agent:** First Agent
**Key Feature:** Global Theme Customizer & Layout Engine

We have successfully implemented a comprehensive "Theme Customizer" that allows users to control the application's global settings dynamically. This system serves as the central hub for managing the application's visual identity and behavior.

**Key Achievements:**
-   **Global Theme Architecture**: Built a robust `LayoutContext` to manage theme state, including colors, fonts, and layout modes (Vertical/Horizontal).
-   **Settings Interface**: Created a dedicated Settings page (`app/settings/page.tsx`) with real-time preview and controls for:
    -   **Branding**: Logo and Favicon uploads for both Light and Dark modes.
    -   **Layout**: Toggle between Full-width and Boxed layouts; Collapsible Vertical Sidebar.
    -   **Color Schemes**: Customization for Header, Sidebar, Horizontal Menu, Footer, and Buttons.
    -   **Components**: Detailed styling for Buttons (border thickness, display mode) and Alerts.
-   **Alert System & Safety**:
    -   Implemented a customizable Alert system (Success, Danger, etc.).
    -   Added **Unsaved Changes Protection**: Intercepts navigation (both in-app and browser-level) to prevent data loss when forms are dirty.

**Timeframe:** Jan 9th, 2026 (Start) - Jan 9th, 2026 (End)
