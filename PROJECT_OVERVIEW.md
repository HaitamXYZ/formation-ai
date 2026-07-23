# Nom du projet

FormationAI

# Presentation du projet

FormationAI est une plateforme web de gestion et de consultation de formations. Le projet combine un frontend Next.js et une API backend ASP.NET Core pour gerer des categories, des formations, des modules pedagogiques, des ressources de modules, des inscriptions et des utilisateurs.

L'application repond au besoin d'organiser un catalogue de formations, d'administrer leur contenu, d'affecter des formateurs et de permettre aux apprenants inscrits d'acceder a leurs modules. Elle integre aussi un formateur IA capable de repondre aux questions a partir du contenu pedagogique disponible.

Les utilisateurs identifies dans le code sont les administrateurs, les formateurs et les apprenants. L'objectif principal est de fournir une plateforme de formation avec gestion des contenus, controle d'acces par role et assistance pedagogique par IA.

# Fonctionnalites principales

- Authentification par inscription, connexion, session courante et deconnexion.
- Gestion des roles `Admin`, `Trainer` et `Learner`.
- Administration des categories de formation.
- Administration des formations : creation, modification, publication/statut, mise en avant et suppression.
- Affectation d'un formateur a une formation.
- Gestion des modules d'une formation : creation, modification, publication, reordonnancement et suppression.
- Gestion des ressources de module : texte manuel, upload de fichiers PDF, DOCX, TXT et Markdown, extraction de texte, activation/desactivation, retraitement et suppression.
- Catalogue public des formations publiees.
- Inscription et desinscription des apprenants a une formation.
- Espace apprenant avec liste des formations inscrites et consultation des modules publies.
- Espace formateur limite aux formations assignees.
- Administration des utilisateurs et des formateurs.
- Formateur IA avec conversations, historique, selection de formation/module, quota d'usage et limitation de frequence.
- Integration d'un avatar IA via Anam.ai lorsque la configuration est disponible.
- Endpoint de sante backend.
- Tests unitaires backend sur les ressources pedagogiques, l'extraction documentaire et la construction du contexte IA.

# Architecture generale

- **Frontend** : application Next.js avec App Router, pages par role, composants React, routes API Next.js servant de proxy vers le backend et authentification stockee dans un cookie HTTP.
- **Backend** : API ASP.NET Core 8 organisee autour de controleurs, services, DTO, entites EF Core, middleware d'erreurs et authentification JWT.
- **Base de donnees** : SQL Server via Entity Framework Core et ASP.NET Core Identity.
- **API** : endpoints REST sous `/api/*` pour l'authentification, le catalogue, les categories, les formations, les modules, les ressources, les inscriptions, les utilisateurs, l'IA et l'avatar.
- **Services externes** : Google Gemini pour le formateur IA et Anam.ai pour la session d'avatar.
- **Intelligence artificielle** : service backend qui construit un contexte a partir des modules et ressources, appelle Gemini, conserve les conversations et applique des quotas.
- **Authentification** : ASP.NET Core Identity + JWT cote backend ; cookie `formationai.auth` cote frontend ; protection des routes Next.js via `proxy.ts`.
- **Stockage de fichiers** : stockage local configurable pour les ressources de modules, avec chemins generes par date.
- **Deploiement** : aucun fichier Docker ou configuration de deploiement specifique n'a ete detecte dans le depot.

# Frontend

Le frontend utilise **Next.js 16**, **React 19**, **TypeScript** et **Tailwind CSS 4**. L'application est organisee avec l'App Router dans `frontend/app`.

Les principales pages detectees sont :

- `/` : page d'accueil.
- `/login` et `/register` : authentification.
- `/admin` : tableau de bord administrateur.
- `/admin/categories` : gestion des categories.
- `/admin/trainings` : gestion des formations.
- `/admin/trainings/[id]` : detail d'une formation, modules et acces au formateur IA.
- `/admin/users` et `/admin/trainers` : gestion des utilisateurs et formateurs.
- `/trainer` et `/trainer/trainings/[trainingId]` : espace formateur et formations assignees.
- `/learner` : accueil apprenant.
- `/learner/catalog` et `/learner/catalog/[trainingId]` : catalogue et detail d'une formation.
- `/learner/trainings` et `/learner/trainings/[trainingId]` : formations suivies et espace de consultation.
- `/learner/ai-trainer` et pages `ai-trainer` rattachees aux formations : assistant IA.

Les principaux composants sont situes dans `frontend/components` : layouts de tableau de bord, navigation, formulaires d'authentification, formulaires de categories/formations/modules, liste des modules, gestion des ressources, composants du chat IA, panneau avatar et composants UI reutilisables.

La navigation est organisee par role dans `DashboardLayout`. Les routes `/admin`, `/trainer` et `/learner` sont protegees par `frontend/proxy.ts`, qui redirige vers `/login` en absence du cookie d'authentification.

La communication avec le backend passe par les routes API Next.js dans `frontend/app/api`. Ces routes lisent le cookie d'authentification, construisent les en-tetes Bearer et appellent l'API ASP.NET Core via `frontend/lib/api/backend-client.ts`. Les appels cote client utilisent `frontend/lib/api/api-client.ts`.

La gestion de l'authentification cote frontend repose sur `AuthProvider`, un contexte React qui charge l'utilisateur courant, expose l'etat de session et fournit la deconnexion. La gestion d'etat globale reste limitee a ce contexte ; les pages et composants utilisent principalement `useState` et `useEffect`.

# Backend

Le backend utilise **ASP.NET Core 8**, **Entity Framework Core**, **ASP.NET Core Identity**, **JWT Bearer** et **Swagger** en environnement de developpement.

L'organisation principale est la suivante :

- `Controllers/` : controleurs REST.
- `Services/` : logique metier.
- `Interfaces/` : contrats des services.
- `Entities/` : entites de persistance.
- `DTOs/` : requetes, reponses et parametres de requete.
- `Configurations/` : configuration EF Core et options applicatives.
- `Data/` : `ApplicationDbContext`.
- `Middleware/` : gestion globale des exceptions.
- `Migrations/` : migrations EF Core.

Les controleurs principaux sont :

- `AuthController` : inscription, connexion, utilisateur courant.
- `CategoriesController` : lecture et administration des categories.
- `TrainingsController` : administration des formations.
- `TrainingModulesController` : gestion des modules.
- `TrainingModuleResourcesController` : gestion des ressources de modules.
- `CatalogController` : catalogue public des formations.
- `EnrollmentsController` : inscription/desinscription apprenant.
- `LearnerTrainingsController` : formations accessibles a l'apprenant.
- `AdminUsersController` et `AdminTrainersController` : administration des utilisateurs et formateurs.
- `TrainersController` : options de formateurs.
- `AITrainerController` : conversations, questions, usage IA.
- `AIAvatarController` : creation de session avatar.
- `HealthController` : verification simple de sante.

Les services couvrent l'authentification, les tokens JWT, l'initialisation des roles, les categories, formations, modules, ressources pedagogiques, inscriptions, controle d'acces, utilisateur, IA, quotas IA, stockage local, extraction de texte PDF/DOCX/TXT et avatar Anam.

Les DTO et validations utilisent des classes de requete/reponse dediees. Les erreurs sont converties en reponses `application/problem+json` par `ExceptionHandlingMiddleware`. L'autorisation est appliquee par attributs `[Authorize]` avec les roles `Admin`, `Trainer` et `Learner`, ainsi que par `TrainingAccessService` pour filtrer l'acces aux formations.

# Base de donnees

La base de donnees utilise **SQL Server** avec **Entity Framework Core**. Le contexte `ApplicationDbContext` herite de `IdentityDbContext<ApplicationUser>`, ce qui ajoute les tables ASP.NET Core Identity en plus des entites metier.

Les principales entites metier sont :

- `ApplicationUser` : utilisateur Identity enrichi avec prenom, nom, statut actif et inscriptions.
- `Category` : categorie de formation.
- `Training` : formation, reliee a une categorie, un formateur optionnel, des modules et des inscriptions.
- `TrainingModule` : module d'une formation, ordonne et publiable.
- `TrainingModuleResource` : ressource de module, texte ou fichier traite.
- `Enrollment` : inscription d'un apprenant a une formation.
- `AIConversation` : conversation IA liee a un utilisateur, une formation et optionnellement un module.
- `AIMessage` : messages d'une conversation IA.

Les relations importantes sont : categorie vers formations, formation vers modules, formation vers inscriptions, utilisateur vers inscriptions, module vers ressources, conversation vers messages, conversation vers formation et module optionnel. La base stocke aussi les conversations et messages IA pour conserver l'historique.

# Structure du projet

```text
/
|-- Backend/
|   |-- Backend.sln
|   |-- Backend/
|   |   |-- Controllers/
|   |   |-- Services/
|   |   |-- Interfaces/
|   |   |-- Entities/
|   |   |-- DTOs/
|   |   |-- Configurations/
|   |   |-- Data/
|   |   |-- Middleware/
|   |   |-- Migrations/
|   |   |-- Program.cs
|   |   |-- Backend.csproj
|   |   |-- appsettings.json
|   |   |-- appsettings.Development.json
|   |   `-- appsettings.Example.json
|   `-- Backend.Tests/
|       |-- Backend.Tests.csproj
|       `-- *Tests.cs
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- public/
|   |-- package.json
|   |-- package-lock.json
|   |-- next.config.ts
|   |-- tsconfig.json
|   |-- eslint.config.mjs
|   |-- postcss.config.mjs
|   |-- proxy.ts
|   `-- .env.local.example
|-- .gitignore
`-- PROJECT_OVERVIEW.md
```

# Technologies utilisees

| Technologie | Utilisation dans le projet |
| ----------- | -------------------------- |
| Next.js | Frontend, App Router et routes API proxy |
| React | Interface utilisateur et composants |
| TypeScript | Typage du frontend |
| Tailwind CSS | Styles frontend via PostCSS |
| ESLint | Analyse statique frontend |
| ASP.NET Core 8 | API backend REST |
| Entity Framework Core | ORM backend et migrations |
| SQL Server | Base de donnees relationnelle |
| ASP.NET Core Identity | Gestion des utilisateurs et roles |
| JWT Bearer | Authentification API |
| Swagger / Swashbuckle | Documentation API en developpement |
| DocumentFormat.OpenXml | Extraction de contenu DOCX |
| PdfPig | Extraction de texte PDF |
| Google Gemini API | Fournisseur du formateur IA |
| Anam.ai SDK/API | Avatar IA cote frontend et creation de session cote backend |
| xUnit | Tests unitaires backend |
| EF Core InMemory | Base en memoire pour les tests |

# Flux de fonctionnement

```text
Utilisateur
-> Frontend Next.js
-> Routes API Next.js
-> API Backend ASP.NET Core
-> Services metier
-> Entity Framework Core
-> SQL Server
```

Pour le formateur IA :

```text
Utilisateur
-> Chat frontend
-> API Next.js
-> AITrainerController
-> AITrainerService
-> ModuleKnowledgeService + historique SQL Server
-> Gemini API
-> Sauvegarde de la reponse dans SQL Server
-> Frontend
```

Pour les ressources pedagogiques :

```text
Admin/Formateur
-> Upload ou texte
-> TrainingModuleResourceService
-> Stockage local du fichier si necessaire
-> Extraction de texte
-> Enregistrement du statut et du texte extrait en base
```

# Configuration

Les principaux fichiers de configuration sont :

- `frontend/package.json` : scripts et dependances frontend.
- `frontend/tsconfig.json` : configuration TypeScript.
- `frontend/eslint.config.mjs` : configuration ESLint Next.js.
- `frontend/postcss.config.mjs` : activation de Tailwind via PostCSS.
- `frontend/next.config.ts` : configuration Next.js.
- `frontend/.env.local.example` : exemple de configuration d'URL backend.
- `frontend/proxy.ts` : protection des routes par cookie d'authentification.
- `Backend/Backend.sln` : solution .NET backend et tests.
- `Backend/Backend/Backend.csproj` : dependances et cible .NET du backend.
- `Backend/Backend.Tests/Backend.Tests.csproj` : dependances de tests.
- `Backend/Backend/appsettings.json` : configuration applicative principale.
- `Backend/Backend/appsettings.Development.json` : configuration de developpement.
- `Backend/Backend/appsettings.Example.json` : exemple de configuration IA et avatar.
- `Backend/Backend/Properties/launchSettings.json` : profils de lancement local.

Variables et sections importantes detectees, sans afficher leurs valeurs :

- `ConnectionStrings:DefaultConnection`
- `Jwt:Key`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:DurationInMinutes`
- `Cors:AllowedOrigins`
- `AI:Provider`
- `AI:ApiKey`
- `AI:Model`
- `Anam:ApiKey`
- `Anam:AvatarId`
- `Anam:AvatarModel`
- `Anam:VoiceId`
- `Anam:PersonaName`
- `Anam:SessionTokenEndpoint`
- `Anam:RequestTimeoutSeconds`
- `AIUsage:LearnerDailyQuestions`
- `AIUsage:TrainerDailyQuestions`
- `AIUsage:AdminDailyQuestions`
- `AIUsage:RequestsPerMinute`
- `AIUsage:MaxConcurrentRequestsPerUser`
- `AIUsage:MaxQuestionLength`
- `AIUsage:HistoryMessagesLimit`
- `ModuleResources:StorageRoot`
- `ModuleResources:MaxFileSizeBytes`
- `ModuleResources:MaxResourcesPerModule`
- `ModuleResources:MaxTextCharacters`
- `ModuleResources:MaxContextCharacters`
- `ModuleResources:ContextChunkCharacters`
- `ModuleResources:MaxSelectedChunks`
- `NEXT_PUBLIC_API_URL`
- `BACKEND_API_URL`

# Lancement du projet

Installer les dependances frontend :

```bash
cd frontend
npm install
```

Lancer le frontend en developpement :

```bash
cd frontend
npm run dev
```

Construire ou lancer le frontend en mode production :

```bash
cd frontend
npm run build
npm run start
```

Restaurer et compiler le backend :

```bash
cd Backend
dotnet restore
dotnet build
```

Lancer le backend :

```bash
cd Backend/Backend
dotnet run
```

Executer les tests backend :

```bash
cd Backend
dotnet test
```

Appliquer les migrations EF Core a la base configuree :

```bash
cd Backend
dotnet ef database update --project Backend/Backend.csproj
```

Aucune commande Docker n'est fournie, car aucun fichier Docker ou `docker-compose` n'a ete detecte.

# Etat actuel du projet

Ce qui semble implemente :

- Structure frontend et backend fonctionnelle.
- Authentification, roles, protection des routes et controle d'acces backend.
- Gestion des categories, formations, modules, ressources, utilisateurs, formateurs et inscriptions.
- Catalogue apprenant et espaces par role.
- Assistant IA avec conversations, historique, contexte issu des modules/ressources et quotas.
- Integration serveur avec Gemini et Anam.ai.
- Migrations EF Core et tests unitaires backend ciblant les ressources et le contexte IA.

Ce qui semble partiellement implemente ou a verifier :

- Le frontend fournit `.env.local.example` avec `BACKEND_API_URL`, tandis que le client backend lit `NEXT_PUBLIC_API_URL`.
- `WeatherForecastController` et `Backend.http` sont encore presents comme elements de template/demo.
- La configuration locale contient des valeurs sensibles ; elles devraient etre externalisees via variables d'environnement ou secret manager.
- L'avatar Anam.ai depend d'une configuration externe complete et valide.

Ce qui n'a pas ete detecte :

- Configuration Docker.
- Pipeline CI/CD.
- Documentation projet specifique hors README Next.js genere.
- Tests frontend.
- Tests d'integration API complets.
