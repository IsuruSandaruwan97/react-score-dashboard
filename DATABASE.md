# Database Configuration Guide

This application supports multiple database types: SQLite, MySQL, and PostgreSQL. You can easily switch between them using environment variables.

## Quick Start

### 1. Choose Your Database

Create a `.env` file in the root directory and configure your database:

#### Option A: SQLite (Recommended for Development)

\`\`\`env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/competition.db
\`\`\`

#### Option B: MySQL

\`\`\`env
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=minecraft_competition
\`\`\`

#### Option C: PostgreSQL

\`\`\`env
DATABASE_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=minecraft_competition
\`\`\`

### 2. Run Migrations

Create the database schema:

\`\`\`bash
npm run db:migrate
\`\`\`

This will create all necessary tables with proper indexes and constraints.

### 3. Seed Initial Data

Add the default main admin account and initial settings:

\`\`\`bash
npm run db:seed
\`\`\`

**Default Admin Credentials:**
- Username: `mainuser`
- Password: `admin123`

⚠️ **Important:** Change this password immediately after first login!

### 4. Import Existing JSON Data (Optional)

If you have existing data in JSON files, import it to the database:

\`\`\`bash
npm run db:import
\`\`\`

This will import:
- All players
- Judges
- Criteria
- Scores
- Settings

## Database Schema

### Tables

- **admins** - Admin users with role-based access
- **judges** - Competition judges with profiles
- **criteria** - Judging criteria with weights
- **players** - Competition participants
- **scores** - Player scores by judge and criterion
- **settings** - Application settings (key-value store)
- **competition_info** - Competition metadata
- **rounds** - Competition rounds information

### Key Features

- Automatic timestamps on all tables
- Foreign key constraints for data integrity
- Indexes for optimal query performance
- Password hashing with bcrypt
- Support for multiple rounds (qualification, finals)

## Switching Databases

To switch from one database to another:

1. Update your `.env` file with new database credentials
2. Run migrations on the new database: `npm run db:migrate`
3. Seed the new database: `npm run db:seed`
4. Optionally import existing data: `npm run db:import`

## Database Management

### SQLite

- Database file location: `./data/competition.db`
- View with tools like [DB Browser for SQLite](https://sqlitebrowser.org/)
- Backup: Simply copy the `.db` file

### MySQL

- Connect with MySQL Workbench or command line
- Backup: `mysqldump -u root -p minecraft_competition > backup.sql`
- Restore: `mysql -u root -p minecraft_competition < backup.sql`

### PostgreSQL

- Connect with pgAdmin or command line
- Backup: `pg_dump minecraft_competition > backup.sql`
- Restore: `psql minecraft_competition < backup.sql`

## Troubleshooting

### Connection Issues

1. Verify your database server is running
2. Check credentials in `.env` file
3. Ensure database exists (create it manually if needed)
4. Check firewall settings

### Migration Errors

If you see "table already exists" errors:
- This is normal for re-running migrations
- The script uses `IF NOT EXISTS` clauses
- Data won't be lost

### Performance

For production:
- Use MySQL or PostgreSQL for better concurrent access
- Enable connection pooling (already configured)
- Regular backups are recommended
- Monitor database size and optimize indexes as needed

## Production Deployment

### Recommended Setup

1. Use PostgreSQL or MySQL for production
2. Set up automated backups
3. Use environment variables for credentials (never commit `.env`)
4. Enable SSL connections for remote databases
5. Monitor database performance

### Environment Variables in Production

For Vercel/Production deployments:
\`\`\`bash
vercel env add DATABASE_TYPE
vercel env add POSTGRES_HOST
vercel env add POSTGRES_PORT
# ... etc
\`\`\`

## Security Notes

- All passwords are hashed with bcrypt (10 rounds)
- Never store plain text passwords
- Use environment variables for sensitive data
- Regular security audits recommended
- Keep database access restricted
\`\`\`

\`\`\`json file="" isHidden
