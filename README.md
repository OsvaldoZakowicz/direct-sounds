# Sonidos de notificacion

Pagina estatica que lista sonidos de uso libre de regalias para usar como url de audio.

## Stack

- html5 + css3 vanilla
- javascript ecs6+ (modulos nativos, sin bundler)
- supabase storage como hosting de los archivos mp3
- nginx (via docker) para desarrollo local
- vercel para produccion

## Requisitos

- docker y docker compose instalados

## Correr en local

```bash
docker compose up
```

la pagina queda disponible en http://localhost:8080

para bajarla:

```bash
docker compose down
```

## Configuracion antes de usar

1. completar `SUPABASE_BASE_URL` en `js/app.js` con la url del proyecto de supabase
2. completar cada entrada de `js/data/sounds.js` con el fileName real subido al bucket, autor y url de origen
3. subir los mp3 al bucket publico `sounds` en supabase storage

## Estructura del proyecto

```
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── data/
│   │   └── sounds.js
│   ├── services/
│   │   ├── sound-repository.js
│   │   ├── audio-player.js
│   │   ├── clipboard-service.js
│   │   └── toast-notifier.js
│   └── factories/
│       └── sound-card-factory.js
├── scripts/
│   ├── env-loader.js
│   ├── supabase-storage-uploader.js
│   ├── upload-sounds.js
│   └── .env.example
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── vercel.json
├── LICENSE
└── README.md
```

## Flujo de trabajo con git

- `main`: rama estable, conectada al deploy de produccion en vercel
- `develop`: rama de trabajo diario, todos los cambios nuevos se hacen aca

flujo tipico:

```bash
git checkout develop
git pull

# trabajar, commitear con conventional commits
git add .
git commit -m "feat: agregar sonido notif-05"

git push origin develop

# cuando develop esta estable y probado, se mergea a main
git checkout main
git merge develop
git push origin main
```

vercel detecta el push a `main` y dispara el deploy de produccion automaticamente.

## Deploy en vercel

1. subir el repo a github (publico)
2. en vercel, new project e importar el repo
3. framework preset: **other** (proyecto estatico, sin build step)
4. build command: dejar vacio
5. output directory: `.` (raiz del proyecto)
6. deploy

vercel usa `main` como rama de produccion por defecto. si se quiere previsualizar `develop` sin promoverla a produccion, vercel genera automaticamente un deploy preview por cada push a cualquier rama que no sea la de produccion.
