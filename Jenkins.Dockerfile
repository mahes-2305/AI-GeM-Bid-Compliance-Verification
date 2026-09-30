FROM my-jenkins

USER root

RUN apt-get update && \
    apt-get install -y awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER jenkins
