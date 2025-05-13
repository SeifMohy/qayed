# Radiant Project

A Next.js application with TypeScript, Tailwind CSS, and best practices for modern web development.

## Project Structure

```
radiant-ts/
├── public/             # Static files
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   │   ├── shared/     # Shared components
│   │   │   └── ui/     # Basic UI elements
│   │   ├── layout/     # Layout components
│   │   ├── upload/     # File upload components
│   │   ├── dashboard/  # Dashboard components
│   │   └── visualization/ # Data visualization components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Key Features

- Next.js App Router for routing
- TypeScript for type safety
- Tailwind CSS for styling
- React Context for state management
- Custom hooks for reusable logic
- Modular component structure
- Type-safe API routes

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling. The configuration is available in `tailwind.config.js`.

## State Management

React Context is used for global state management. Context providers are located in the `src/contexts` directory.

## TypeScript

TypeScript is used for type safety. Custom types are defined in the `src/types` directory.

## License

See the LICENSE.md file for details.
