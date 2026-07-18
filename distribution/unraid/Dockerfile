# syntax=docker/dockerfile:1

ARG BASE_IMAGE=lscr.io/linuxserver/sonarr:latest
FROM ${BASE_IMAGE}

ARG BUILD_VERSION=custom

USER root

RUN rm -rf /app/sonarr/bin/*

COPY Sonarr/ /app/sonarr/bin/

RUN chmod +x /app/sonarr/bin/Sonarr && \
    rm -rf /app/sonarr/bin/Sonarr.Update && \
    printf "UpdateMethod=docker\nBranch=main\nPackageVersion=%s\nPackageAuthor=Custom GHCR build\n" \
        "${BUILD_VERSION}" > /app/sonarr/package_info

LABEL org.opencontainers.image.title="Sonarr v4 - streaming interactive search"
LABEL org.opencontainers.image.description="Custom Sonarr v4 image with streamed interactive-search results and per-search indexer selection"
