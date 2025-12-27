# Minecraft Competition Web App

A full-featured competition management system for Minecraft building competitions with role-based authentication, score entry, and live results.

## Features

- **Public Pages**
  - Home page with competition info and stats
  - Player list with search functionality
  - Live results and leaderboard
  - Snow falling effect and Santa sleigh animation
  - Curtain preloader on home page

- **Admin Panel**
  - Role-based authentication (Main Admin & Normal Admin)
  - Dashboard with statistics and controls
  - Score entry with Excel-like interface
  - Player management with CSV upload
  - Judge management
  - Criteria management with drag-and-drop reordering
  - Settings control for finals and results visibility
  - Temporary password system for new admins

- **Database Support**
  - SQLite (development)
  - MySQL (production)
  - PostgreSQL (production)
  - Easy switching via environment variables

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Copy `.env.example` to `.env` and configure your database:

```bash
cp .env.example .env
```

For development, SQLite is already configured. For production, see [DATABASE.md](./DATABASE.md).

### 3. Setup Database

```bash
npm run db:setup
```

This will create tables and seed initial data including the main admin account.

**Default Admin Credentials:**
- Username: `mainuser`
- Password: `admin123`

### 4. Import Existing Data (Optional)

If you have existing JSON data:

```bash
npm run db:import
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── players/           # Player list page
│   ├── results/           # Results page
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities and database
│   ├── db/               # Database configuration
│   │   ├── client.ts     # Database client
│   │   ├── config.ts     # Database configuration
│   │   ├── schema.sql    # Database schema
│   │   └── repositories/ # Data access layer
│   ├── auth.ts           # Authentication store
│   └── password-utils.ts # Password hashing
├── scripts/              # Database scripts
│   ├── migrate.ts        # Run migrations
│   ├── seed.ts           # Seed initial data
│   └── import-json-data.ts # Import from JSON
├── data/                 # JSON data files (backup)
└── public/               # Static files
```

## Database Management

### Available Scripts

- `npm run db:migrate` - Create database schema
- `npm run db:seed` - Seed initial data
- `npm run db:import` - Import from JSON files
- `npm run db:setup` - Run migrate + seed

### Switching Databases

See [DATABASE.md](./DATABASE.md) for detailed instructions on:
- Configuring different database types
- Migration procedures
- Backup and restore
- Production deployment

## Admin Panel

Access the admin panel at `/admin`

### Main Admin Capabilities
- Full access to all features
- User management
- Judge and criteria management
- Finals round control
- Results visibility toggle
- Score entry

### Normal Admin Capabilities
- Score entry only
- View dashboard statistics

## Features Guide

### Score Entry
- Excel-like interface with expandable rows
- Each player row expands to show all judges
- Individual save per player
- Support for qualification and finals rounds
- Real-time validation

### Player Management
- CSV upload for bulk import
- Download template available
- Search and filter capabilities

### Criteria Management
- Drag-and-drop reordering
- Configurable max points
- Active/inactive toggle

### Finals Round
- Main admin can enable finals
- Automatically locks qualification scores
- Separate scoring for each round

## Customization

### Theme & Styling
- Dark esports theme with purple/cyan accents
- Customizable in `app/globals.css`
- Design tokens for consistent theming

### Santa Sleigh Animation
- Configurable via settings
- Can be enabled/disabled
- Timing and appearance customizable

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Ensure database is configured

## Security

- All passwords hashed with bcrypt
- Role-based access control
- Temporary passwords for new admins
- Session persistence with Zustand

## Support

For issues or questions, refer to:
- [DATABASE.md](./DATABASE.md) - Database configuration
- [.env.example](./.env.example) - Environment variables

## License

Private project for CWR Esports
