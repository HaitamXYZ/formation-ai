# FormationAI

FormationAI est une plateforme web de gestion de formations avec espaces administrateur et apprenant.

## Technologies

- Frontend : Next.js, React, TypeScript, Tailwind CSS
- Backend : ASP.NET Core 8, Entity Framework Core, ASP.NET Core Identity
- Base de donnees : SQL Server
- IA : Google Gemini et avatar vocal Anam.ai

## Lancement local

Frontend :

```bash
cd frontend
npm install
npm run dev
```

Backend :

```bash
cd Backend/Backend
dotnet restore
dotnet run
```

## Configuration

Le frontend lit l'URL de l'API avec :

```text
NEXT_PUBLIC_API_URL
```

Le backend utilise notamment :

```text
ConnectionStrings__DefaultConnection
Jwt__Key
Cors__AllowedOrigins__0
AI__Provider
AI__ApiKey
AI__Model
Anam__ApiKey
Anam__AvatarId
Anam__AvatarModel
Anam__VoiceId
Anam__LanguageCode
SeedAdmin__Email
SeedAdmin__Password
```

## Deploiement

- Frontend : Vercel, root directory `frontend`
- Backend : Railway, root directory `Backend/Backend`
- Base SQL Server : service externe compatible SQL Server
