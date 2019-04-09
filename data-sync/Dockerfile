FROM mongo:4.0

RUN apt-get update -qq && apt-get install -y awscli && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD ./export-mongo.sh .
ADD ./import-mongo.sh .

CMD ["sh", "./export-mongo.sh"]
