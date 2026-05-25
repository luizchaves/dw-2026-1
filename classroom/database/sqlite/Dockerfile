FROM alpine:3.23

RUN apk --no-cache add sqlite

WORKDIR /db

ENTRYPOINT ["/bin/sh", "-c"]

CMD [ "sqlite3", "database.db" ]
