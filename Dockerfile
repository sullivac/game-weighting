FROM node:14.16.0-alpine3.13 as build

WORKDIR /workspace/app

COPY ./ ./

RUN npm ci --production

FROM node:14.16.0-alpine3.13 as application

WORKDIR /usr/local/game-weighting

RUN addgroup -g 91001 game-weighting \
    && adduser --uid 91000 --ingroup game-weighting --disabled-password game-weighting

USER game-weighting

COPY --from=build /workspace/app ./

VOLUME [ "/home/gw/.googleapis" ]

CMD ["node", "."]
