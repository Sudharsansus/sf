# 0005. Code-rendered thumbnails; Indic text in worker-media

Status: Accepted · Date: 2026-10-21

## Context
Satori (used to render thumbnails) cannot shape Indic scripts correctly.

## Decision
Thumbnail headlines are written in English and rendered with satori/resvg on any host. Indic-script captions and video text render in worker-media with ffmpeg/libass and Noto fonts, which shape them correctly.

## Consequences
Thumbnails work everywhere today; native-script covers are a follow-up in worker-media.
