# Legacy Migrations

These are hand-written SQL migration scripts from before the project adopted Prisma.

**They are historical reference only.** The canonical schema is now managed by Prisma:
- Schema definition: `prisma/schema.prisma`
- Migration history: `prisma/migrations/`

To make schema changes, edit `prisma/schema.prisma` and run:
```bash
npx prisma migrate dev --name describe_the_change
```
