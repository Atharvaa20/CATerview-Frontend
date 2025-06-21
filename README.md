# Caterview Frontend

This is the frontend for the Caterview application, built with Next.js and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run analyze` - Analyze bundle size

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

## Deployment

### Vercel

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository on [Vercel](https://vercel.com/import)
3. Set up the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_ENV` - `production`
4. Deploy!

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `NEXT_PUBLIC_API_URL` - Your production backend URL
- `NEXT_PUBLIC_ENV` - `production`
- `NEXT_PUBLIC_SITE_URL` - Your production frontend URL (for sitemap)

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Axios](https://axios-http.com/) - HTTP client

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
