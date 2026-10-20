# Container images

One Dockerfile builds every Node service:

```bash
docker build -f infra/docker/node.Dockerfile --build-arg APP=api          -t isaii-api .
docker build -f infra/docker/node.Dockerfile --build-arg APP=worker-ai    -t isaii-worker-ai .
docker build -f infra/docker/node.Dockerfile --build-arg APP=worker-media -t isaii-worker-media .
```

`worker-media` adds ffmpeg and Noto fonts (Devanagari, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Gurmukhi, Odia, Arabic) so captions render correctly in every Indian script.
The web app deploys to Vercel and is not containerised. Images are host-agnostic: any container platform works.
